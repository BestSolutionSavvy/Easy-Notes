const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controllers/pdfController");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.route("/upload")
    .post(upload.single("pdf"), controller.uploadPdf);

router.route("/search")
    .get(controller.findPdfsByOwner);

router.route("/:id")
    .get(controller.readPdfData)
    .delete(controller.deletePdf);

router.route("/:id/download")
    .get(controller.downloadPdf);

router.route("/:id/upload")
    .put(upload.single("pdf"), controller.updatePdf);

module.exports = router;
