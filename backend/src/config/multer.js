const multer = require("multer");

const storage = multer.memoryStorage();

const SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: storage,
  limits: {
    fileSize: SIZE_LIMIT,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

module.exports = { upload };
