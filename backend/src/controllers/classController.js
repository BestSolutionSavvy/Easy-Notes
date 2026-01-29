const classesModel = require("../models/classesModel");
const { pdfModel } = require("../models/pdfsModel");
const { sendNotification } = require("../models/subscriptionsModel");
const { userModel } = require("../models/usersModel");

// GET /classes
exports.listClasses = async (req, res) => {
  try {
    const classes = await classesModel.find();
    if (!classes || classes.length === 0) {
      return res.status(404).json({ error: "No classes found" });
    }
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /classes
exports.createClass = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Invalid class data" });
  }
  try {
    const newClass = new classesModel(req.body);
    const doc = await newClass.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /classes/:id
exports.getClassById = async (req, res) => {
  const classId = req.params.id;
  try {
    const classDoc = await classesModel.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(classDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /classes/:id
exports.updateClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const updatedClass = await classesModel.findByIdAndUpdate(classId, req.body, { new: true });
    if (!updatedClass) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /classes/:id/pdfs
exports.uploadPdfToClass = async (req, res) => {
  const classId = req.params.id;
  const { pdfs } = req.body;

  if (!pdfs || !Array.isArray(pdfs)) {
    return res.status(400).json({ error: "PDF IDs array is required" });
  }

  try {
    const classDoc = await classesModel.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found" });
    }
    classDoc.pdfs = pdfs;
    await classDoc.save();
    const newPdfId = pdfs[pdfs.length - 1];
    const newPdf = await pdfModel.findById(newPdfId);
    if (newPdf) {
      const users = await userModel.find({ classes: classId }).select("email");
      const notificationPromises = users.map((user) => {
        return sendNotification(user.email, {
          title: "New PDF Uploaded",
          body: `A new PDF ${newPdf.name} has been uploaded to your class ${classDoc.name}.`,
          data: {
            type: "NEW_PDF",
            pdfId: newPdfId,
            classId: classId,
          },
        });
      });
      await Promise.all(notificationPromises);
    }

    res.status(200).json(classDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /classes/:id
exports.deleteClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const classDoc = await classesModel.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found" });
    }
    const classPdfs = classDoc.pdfs;
    if (classPdfs && classPdfs.length > 0) {
      await pdfModel.deleteMany({ _id: { $in: classPdfs } });
    }
    await userModel.updateMany(
      { classes: classId },
      { $pull: { classes: classId } },
    );
    await classesModel.findByIdAndDelete(classId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
