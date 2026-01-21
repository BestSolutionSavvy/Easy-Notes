const { notebookModel } = require('../models/notebookModel');

exports.listNotebooks = (req, res) => {
    notebookModel.find()
        .then(notebooks => {
            if (!notebooks || notebooks.length === 0) {
                return res.status(404).json({ error: 'No notebooks found' });
            }
            res.json(notebooks);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

exports.createNotebook = (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Invalid notebook data' });
    }
    const newNotebook = new notebookModel(req.body);
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
        .then(updatedNotebook => {
            if (!updatedNotebook) {
                return res.status(404).json({ error: 'Notebook not found' });
            }
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
