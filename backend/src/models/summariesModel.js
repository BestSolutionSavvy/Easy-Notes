const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { _id: false });

summarySchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const summaryModel = mongoose.model('Summary', summarySchema);

module.exports = { summaryModel };