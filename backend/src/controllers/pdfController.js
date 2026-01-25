const { pdfModel } = require("../models/pdfsModel");
const { userModel } = require("../models/usersModel");
const mongoose = require("mongoose");
const { PDFDocument } = require("pdf-lib");

let gridFSBucket;

mongoose.connection.once("open", () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "pdfs",
  });
});

// POST /pdfs/upload - Upload a new PDF file with metadata
exports.uploadPdf = async (req, res) => {
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
  try {
    const uploadStream = gridFSBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);
    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });
    const name = req.file.originalname.replace(/\.pdf$/i, "");
    const newPdf = new pdfModel({
      name,
      type,
      owner,
      gridFsFileId: uploadStream.id,
    });
    const savedPdf = await newPdf.save();
    res.status(201).json(savedPdf);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /pdfs/:id - Read PDF metadata only
exports.readPdfData = async (req, res) => {
  const { id } = req.params;
  try {
    const pdf = await pdfModel.findById(id);
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }
    const owner = await userModel.findOne({ email: pdf.owner });
    const pdfData = pdf.toJSON();
    if (owner) {
      pdfData.owner = owner.toUserInfo();
    }
    res.json(pdfData);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
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
    const files = await gridFSBucket.find({ _id: pdf.gridFsFileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: "File not found in GridFS" });
    }
    if (!page) {
      const downloadStream = gridFSBucket.openDownloadStream(pdf.gridFsFileId);
      res.set("Content-Type", "application/pdf");
      res.set("Content-Disposition", `attachment; filename="${pdf.name}.pdf"`);
      downloadStream.pipe(res);
      downloadStream.on("error", (err) => {
        console.error("GridFS download error:", err);
        if (!res.headersSent) {
          res
            .status(404)
            .json({ message: "Error downloading file", error: err.message });
        }
      });
      return;
    }
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }
    const chunks = [];
    const downloadStream = gridFSBucket.openDownloadStream(pdf.gridFsFileId);
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("error", (err) => {
      console.error("GridFS download error:", err);
      if (!res.headersSent) {
        res.status(404).json({ message: "Error downloading file", error: err.message });
      }
    });
    
    downloadStream.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();
        if (pageNum > totalPages) {
          return res.status(400).json({ 
            message: `Page ${pageNum} not found. PDF has ${totalPages} pages.` 
          });
        }
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
        const newPdfBytes = await newPdfDoc.save();
        res.set("Content-Type", "application/pdf");
        res.set("Content-Disposition", `attachment; filename="${pdf.name}_page${pageNum}.pdf"`);
        res.send(Buffer.from(newPdfBytes));
      } catch (err) {
        console.error("PDF extraction error:", err);
        res.status(500).json({ message: "Error extracting page", error: err.message });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /pdfs/:id/upload - Replace PDF file (upload new version)
exports.updatePdf = async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const pdf = await pdfModel.findById(id);
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }
    await gridFSBucket.delete(pdf.gridFsFileId);
    const uploadStream = gridFSBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on("finish", async () => {
      pdf.gridFsFileId = uploadStream.id;
      const updatedPdf = await pdf.save();
      res.json(updatedPdf);
    });
    uploadStream.on("error", (err) => {
      res
        .status(500)
        .json({ message: "Error uploading file", error: err.message });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /pdfs/:id - Delete PDF (metadata and file from GridFS)
exports.deletePdf = async (req, res) => {
  const { id } = req.params;
  try {
    const pdf = await pdfModel.findById(id);
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }
    await gridFSBucket.delete(pdf.gridFsFileId);
    await pdfModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /pdfs/search?owner=email - Get list of PDF metadata by owner
exports.findPdfsByOwner = async (req, res) => {
  const { owner } = req.query;
  if (!owner) {
    return res
      .status(400)
      .json({ message: "Owner query parameter is required" });
  }
  try {
    const pdfs = await pdfModel.find({ owner });
    const ownerData = await userModel.findOne({ email: owner });
    const pdfsWithOwner = pdfs.map((pdf) => {
      const pdfData = pdf.toJSON();
      if (ownerData) {
        pdfData.owner = ownerData.toUserInfo();
      }
      return pdfData;
    });
    res.json(pdfsWithOwner);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
