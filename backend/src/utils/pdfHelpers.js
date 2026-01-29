const { pdfModel } = require("../models/pdfsModel");
const { notebookModel } = require("../models/notebooksModel");
const classModel = require("../models/classesModel");
const { getGridFSBucket } = require("../config/gridfs");
const { PDFDocument } = require("pdf-lib");

/**
 * Check if a PDF is referenced by notebooks or other classes
 * @param {ObjectId} pdfId - The PDF ID to check
 * @param {Array<ObjectId>} excludedClassIds - Class IDs to exclude from the check
 * @param {Session} session - MongoDB session for transaction
 * @returns {Promise<boolean>} True if PDF is referenced elsewhere
 */
const isPdfReferenced = async (pdfId, excludedClassIds, session) => {
  const notebookRef = await notebookModel
    .findOne({ id_pdf: pdfId.toString() })
    .session(session);
  if (notebookRef) return true;
  const classRef = await classModel
    .findOne({ pdfs: pdfId, _id: { $nin: excludedClassIds } })
    .session(session);
  return !!classRef;
};

/**
 * Delete a PDF file from GridFS and its database record
 * @param {Object} pdf - The PDF document to delete
 * @param {Session} session - MongoDB session for transaction
 */
const deletePdfFile = async (pdf, session) => {
  const gridFSBucket = getGridFSBucket();
  try {
    await gridFSBucket.delete(pdf.gridFsFileId);
  } catch (err) {
    console.error(`Error deleting GridFS file ${pdf.gridFsFileId}:`, err.message);
  }
  await pdfModel.findByIdAndDelete(pdf._id).session(session);
};

/**
 * Stream full PDF to response
 * @param {Object} gridFSBucket - GridFS bucket instance
 * @param {Object} pdf - The PDF document
 * @param {Object} res - Express response object
 */
const streamFullPdf = (gridFSBucket, pdf, res) => {
  const downloadStream = gridFSBucket.openDownloadStream(pdf.gridFsFileId);
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `attachment; filename="${pdf.name}.pdf"`);
  downloadStream.pipe(res);
  downloadStream.on("error", (err) => {
    console.error("GridFS download error:", err);
    if (!res.headersSent) {
      res.status(404).json({ message: "Error downloading file", error: err.message });
    }
  });
};

/**
 * Extract single page from PDF
 * @param {Object} gridFSBucket - GridFS bucket instance
 * @param {Object} pdf - The PDF document
 * @param {number} pageNum - Page number to extract (1-indexed)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const extractPdfPage = async (gridFSBucket, pdf, pageNum, res) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const downloadStream = gridFSBucket.openDownloadStream(pdf.gridFsFileId);
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("error", (err) => {
      console.error("GridFS download error:", err);
      if (!res.headersSent) {
        res.status(404).json({ message: "Error downloading file", error: err.message });
      }
      reject(err);
    });
    downloadStream.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();
        if (pageNum > totalPages) {
          return res.status(400).json({
            message: `Page ${pageNum} not found. PDF has ${totalPages} pages.`,
          });
        }
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
        const newPdfBytes = await newPdfDoc.save();
        res.set("Content-Type", "application/pdf");
        res.set("Content-Disposition", `attachment; filename="${pdf.name}_page${pageNum}.pdf"`);
        res.send(Buffer.from(newPdfBytes));
        resolve();
      } catch (err) {
        console.error("PDF extraction error:", err);
        res.status(500).json({ message: "Error extracting page", error: err.message });
        reject(err);
      }
    });
  });
};

/**
 * Upload file to GridFS
 * @param {Object} gridFSBucket - GridFS bucket instance
 * @param {Object} file - Multer file object
 * @returns {Promise<ObjectId>} GridFS file ID
 */
const uploadToGridFS = (gridFSBucket, file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });
    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id);
    });

    uploadStream.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = {
  isPdfReferenced,
  deletePdfFile,
  streamFullPdf,
  extractPdfPage,
  uploadToGridFS,
};
