const { pdfModel } = require("../models/pdfsModel");
const { userModel } = require("../models/usersModel");
const { getGridFSBucket } = require("../config/gridfs");
const {
  isPdfReferenced,
  deletePdfFile,
  streamFullPdf,
  extractPdfPage,
  uploadToGridFS,
} = require("../utils/pdfHelpers");
const mongoose = require("mongoose");

// Populate owner info on PDF data
const populateOwnerInfo = async (pdfData, ownerEmail) => {
  const owner = await userModel.findOne({ email: ownerEmail });
  if (owner) {
    pdfData.owner = owner.toUserInfo();
  }
  return pdfData;
};

// POST /pdfs/upload
exports.uploadPdf = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const { type, owner } = req.body;
  if (!type || !owner) {
    return res
      .status(400)
      .json({ message: "Missing required fields: type, owner" });
  }
  if (!["class", "note"].includes(type)) {
    return res
      .status(400)
      .json({ message: "Invalid type. Must be 'class' or 'note'" });
  }
  const gridFSBucket = getGridFSBucket();
  uploadToGridFS(gridFSBucket, req.file)
    .then((gridFsFileId) => {
      const name = req.file.originalname.replace(/\.pdf$/i, "");
      const newPdf = new pdfModel({
        name,
        type,
        owner,
        gridFsFileId,
      });
      return newPdf.save();
    })
    .then((savedPdf) => {
      res.status(201).json(savedPdf);
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// GET /pdfs/search?owner=email
exports.findPdfsByOwner = (req, res) => {
  const { owner } = req.query;
  if (!owner) {
    return res
      .status(400)
      .json({ message: "Owner email query parameter is required" });
  }
  pdfModel
    .find({ owner })
    .then((pdfs) => {
      const promises = pdfs.map((pdf) =>
        populateOwnerInfo(pdf.toJSON(), owner),
      );
      return Promise.all(promises);
    })
    .then((pdfsWithOwner) => {
      res.json(pdfsWithOwner);
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// GET /pdfs/:id
exports.readPdfData = (req, res) => {
  const { id } = req.params;
  pdfModel
    .findById(id)
    .then((pdf) => {
      if (!pdf) {
        return res.status(404).json({ message: "PDF not found" });
      }
      return populateOwnerInfo(pdf.toJSON(), pdf.owner);
    })
    .then((pdfData) => {
      res.json(pdfData);
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// GET /pdfs/:id/download?page=...
exports.downloadPdf = async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;
  try {
    const pdf = await pdfModel.findById(id);
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }
    const gridFSBucket = getGridFSBucket();
    const files = await gridFSBucket.find({ _id: pdf.gridFsFileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: "File not found in GridFS" });
    }
    if (!page) {
      streamFullPdf(gridFSBucket, pdf, res);
      return;
    }
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }
    await extractPdfPage(gridFSBucket, pdf, pageNum, res);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /pdfs/:id/upload
exports.updatePdf = (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  pdfModel
    .findById(id)
    .then((pdf) => {
      if (!pdf) {
        return res.status(404).json({ message: "PDF not found" });
      }
      const gridFSBucket = getGridFSBucket();
      return gridFSBucket.delete(pdf.gridFsFileId).then(() => {
        return uploadToGridFS(gridFSBucket, req.file).then((gridFsFileId) => {
          pdf.gridFsFileId = gridFsFileId;
          return pdf.save();
        });
      });
    })
    .then((updatedPdf) => {
      res.json(updatedPdf);
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err.message });
    });
};

// DELETE /pdfs/:id
exports.deletePdf = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  try {
    const pdf = await pdfModel.findById(id).session(session);
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }
    const isReferenced = await isPdfReferenced(pdf._id, [], session);
    if (isReferenced) {
      return res.status(200).json({
        message:
          "PDF not deleted: it is still referenced by a notebook or class",
      });
    }
    await deletePdfFile(pdf, session);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    session.endSession();
  }
};
