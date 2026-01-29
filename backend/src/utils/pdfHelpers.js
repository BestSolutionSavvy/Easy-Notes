const { pdfModel } = require("../models/pdfsModel");
const { notebookModel } = require("../models/notebooksModel");
const classModel = require("../models/classesModel");
const { getGridFSBucket } = require("../config/gridfs");

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

module.exports = {
  isPdfReferenced,
  deletePdfFile,
};
