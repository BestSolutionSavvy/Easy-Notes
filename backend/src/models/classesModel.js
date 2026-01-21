const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});
const classModel = mongoose.model('Class', classSchema);

module.exports = classModel;