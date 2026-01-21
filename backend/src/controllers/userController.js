const { userModel } = require("../models/usersModel");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

// GET /users?email=...
exports.getUser = (req, res) => {
  const { email } = req.query;
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

// PUT /users?email=...
exports.updateUser = async (req, res) => {
  const { email } = req.query;
  const { password, name, surname } = req.body;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  if (password && password.length < 8) {
    return res
      .status(400)
      .json({ message: "Weak password - must be at least 8 characters" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (password) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
    }
    if (name !== undefined) user.name = name;
    if (surname !== undefined) user.surname = surname;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /users?email=...
exports.deleteUser = (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  userModel
    .findOneAndDelete({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// POST /users/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({
      message: "Login successful",
      user: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /users/signup?role=...
exports.signup = async (req, res) => {
  const { role } = req.query;
  const { email, password, name, surname } = req.body;
  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email and password are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Weak password - must be at least 8 characters" });
  }
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new userModel({
      email,
      password: hashedPassword,
      name: name || "",
      surname: surname || "",
      role,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
