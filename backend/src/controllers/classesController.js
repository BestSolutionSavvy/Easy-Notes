const classesModel = require('../models/classesModel');

exports.listClasses = (req, res) => {
    classesModel.find()
        .then(classes => {
            if (!classes || classes.length === 0) {
                return res.status(404).json({ error: 'No classes found' });
            }
            res.json(classes);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

exports.createClass = (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Invalid class data' });
    }
    const newClass = new classesModel(req.body);
    newClass.save()
        .then(doc => {
            res.status(201).json(doc);
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
}

exports.getClassById = (req, res) => {
    const classId = req.params.id;
    classesModel.findById(classId)
        .then(classDoc => {
            if (!classDoc) {
                return res.status(404).json({ error: 'Class not found' });
            }
            res.json(classDoc);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

exports.updateClass = (req, res) => {
    const classId = req.params.id;
    classesModel.findByIdAndUpdate(classId, req.body, { new: true })
        .then(updatedClass => {
            if (!updatedClass) {
                return res.status(404).json({ error: 'Class not found' });
            }
            res.json(updatedClass);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

exports.deleteClass = (req, res) => {
    const classId = req.params.id;
    classesModel.findByIdAndDelete(classId)
        .then(deletedClass => {
            if (!deletedClass) {
                return res.status(404).json({ error: 'Class not found' });
            }
            res.status(204).send();
        })
        .catch(err => res.status(500).json({ error: err.message }));
}
