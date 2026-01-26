const { text } = require('express');
const mongoose = require('mongoose')

const notebookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    id_pdf: {
                type: String,
                required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    last_page: {
        type: Number,
        default: 0
    },
    num_pages: {
        type: Number,
        default: 0
    },
    num_pdf_pages: {
        type: Number,
        default: 0
    },
    pages: [
        {
            page_number: {
                type: Number,
                required: true
            },
            slide_number: {
                type: Number,
                required: false
            },
            note_content: {
                type: String,
                required: true
            },
            text_boxes: [
                {
                    left: Number,
                    top: Number,
                    width: Number,
                    height: Number,
                    content: String,
                }
            ],
            highlights: [
                {
                    left: Number,
                    top: Number,
                    width: Number,
                    height: Number,
                    content: String,
                }
            ]
        }
    ]

});

const notebookModel = mongoose.model('Notebook', notebookSchema)
module.exports = { notebookModel }