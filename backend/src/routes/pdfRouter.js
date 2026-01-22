const express = require("express");
const router = express.Router();
const { upload } = require("../config/multer");
const controller = require("../controllers/pdfController");

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
