const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    }
});
const classModel = mongoose.model('Class', classSchema);

module.exports = classModel;