const { notebookModel } = require('../models/notebooksModel');
const { summaryModel } = require('../models/summariesModel');

exports.listNotebooks = (req, res) => {
    notebookModel.find({owner: req.params.email})
        .then(notebooks => {
            res.json(notebooks);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

exports.createNotebook = (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Invalid notebook data' });
    }
    const owner = req.params.email;
    const newNotebook = new notebookModel({
        ...req.body,
        owner: owner
    });
    newNotebook.save()
        .then(doc => {
            res.status(201).json(doc);
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
}

exports.getNotebookById = (req, res) => { 
    const notebookId = req.params.id;
    notebookModel.findById(notebookId)
        .then(notebookDoc => {
            if (!notebookDoc) {
                return res.status(404).json({ error: 'Notebook not found' });
            }
            res.json(notebookDoc);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

exports.updateNotebook = (req, res) => { 
    const notebookId = req.params.id;
    notebookModel.findByIdAndUpdate(notebookId, req.body, { new: true })
        .then(async updatedNotebook => {
            if (!updatedNotebook) {
                return res.status(404).json({ error: 'Notebook not found' });
            }
            await summaryModel.findByIdAndDelete(notebookId).catch(err => {
                console.error('Error deleting summary:', err);
            });
            res.json(updatedNotebook);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

exports.deleteNotebook = (req, res) => { 
    const notebookId = req.params.id;
    notebookModel.findByIdAndDelete(notebookId)
        .then(deletedNotebook => {
            if (!deletedNotebook) {
                return res.status(404).json({ error: 'Notebook not found' });
            }
            res.status(204).send();
        })
        .catch(err => res.status(500).json({ error: err.message }));
}
