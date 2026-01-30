const { userModel } = require("../models/usersModel");
const classModel = require("../models/classesModel");
const { pdfModel } = require("../models/pdfsModel");
const bcrypt = require("bcrypt");
const { setAuthCookie } = require("../config/jwt");
const mongoose = require("mongoose");
const { isPdfReferenced, deletePdfFile } = require("../utils/pdfHelpers");

const SALT_ROUNDS = 12;

// POST /users/login
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }
  userModel
    .findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const userResponse = setAuthCookie(res, user);
        res.json({
          message: "Login successful",
          user: userResponse,
        });
      });
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// POST /users/signup?role=...
exports.signup = (req, res) => {
  const { role } = req.query;
  const { email, password, name, surname } = req.body;
  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Weak password - must be at least 8 characters" });
  }
  userModel
    .findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(409).json({ message: "email already exists" });
      }
      return bcrypt.hash(password, SALT_ROUNDS).then((hashedPassword) => {
        const newUser = new userModel({
          email,
          password: hashedPassword,
          name: name || "",
          surname: surname || "",
          role,
        });
        return newUser.save().then((savedUser) => {
          const userResponse = setAuthCookie(res, savedUser);
          res.status(201).json({
            message: "Signup successful",
            user: userResponse,
          });
        });
      });
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// POST /users/logout
exports.logout = (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 0,
  });
  res.json({ message: "Logout successful" });
};

// GET /users/verify
exports.verifyToken = (req, res) => {
  userModel
    .findById(req.user.id)
    .select("-password")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        message: "Token valid",
        user: user,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// GET /users/:email
exports.getUser = (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  userModel
    .findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// PUT /users/:email
exports.updateUser = (req, res) => {
  const { email } = req.params;
  const { password, name, surname, classes } = req.body;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  if (password && password.length < 8) {
    return res
      .status(400)
      .json({ message: "Weak password - must be at least 8 characters" });
  }
  userModel
    .findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (surname !== undefined) updateFields.surname = surname;
      if (classes !== undefined) updateFields.classes = classes;
      const hashPromise = password
        ? bcrypt.hash(password, SALT_ROUNDS)
        : Promise.resolve(null);
      return hashPromise.then((hashedPassword) => {
        if (hashedPassword) {
          updateFields.password = hashedPassword;
        }
        return userModel
          .findOneAndUpdate(
            { email },
            { $set: updateFields },
            { new: true, runValidators: true },
          )
          .select("-password");
      });
    })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// DELETE /users/:email
exports.deleteUser = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await userModel.findOneAndDelete({ email }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }
    const userClasses = await classModel
      .find({ teacher: email })
      .session(session);
    const classIds = userClasses.map((c) => c._id);
    if (classIds.length > 0) {
      const classes = await classModel
        .find({ _id: { $in: classIds } })
        .session(session);
      const pdfIds = classes.flatMap((cls) => cls.pdfs || []);
      if (pdfIds.length > 0) {
        const pdfsToDelete = await pdfModel
          .find({ _id: { $in: pdfIds } })
          .session(session);
        for (const pdf of pdfsToDelete) {
          const isReferenced = await isPdfReferenced(
            pdf._id,
            classIds,
            session,
          );
          if (!isReferenced) {
            await deletePdfFile(pdf, session);
          }
        }
      }
      await classModel.deleteMany({ _id: { $in: classIds } }).session(session);
    }
    await session.commitTransaction();
    session.endSession();
    res.status(204).send();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
