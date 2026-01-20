const mongoose = require('mongoose')

const notebookSchema = new mongoose.Schema({
    
});

const notebookModel = mongoose.model('Notebook', notebookSchema)
module.exports = { notebookModel }