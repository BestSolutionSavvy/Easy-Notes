const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
    enum: ["class", "note"],
  },
  owner: {
    type: String,
    ref: "User",
    required: true,
  },
  gridFsFileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

// Automatically exclude __v when converting to JSON
pdfSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const pdfModel = mongoose.model("Pdf", pdfSchema);
module.exports = { pdfModel };