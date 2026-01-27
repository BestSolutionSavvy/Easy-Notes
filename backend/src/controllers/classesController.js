const classesModel = require('../models/classesModel');
const { pdfModel } = require('../models/pdfsModel');
const { subscriptionModel, sendNotification } = require('../models/subscriptionModel');
const { userModel } = require('../models/usersModel');

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

exports.uploadPdfToClass = async (req, res) => {
    const classId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const classDoc = await classesModel.findById(classId);
        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }
        const newPdf = new pdfModel({
            name: req.file.originalname.replace(/\.pdf$/i, ''),
            type: 'class',
            owner: classDoc.teacher,
            gridFsFileId: req.file.id,
        });
        const savedPdf = await newPdf.save();
        classDoc.pdfs.push(savedPdf._id);
        await classDoc.save();
        // send notification to users about new PDF upload
        const userIds = await userModel.find({ classes: classId }).select('_id');
        const notificationPromises = userIds.map(user => {
            return sendNotification(user.email, {
                title: 'New PDF Uploaded',
                body: `A new PDF "${savedPdf.name}" has been uploaded to your class.`,
            });
        });
        await Promise.all(notificationPromises);
        res.status(201).json(savedPdf);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteClass = async (req, res) => {
    const classId = req.params.id;
    try {
        const classDoc = await classesModel.findById(classId);
        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }
        const classPdfs = classDoc.pdfs;
        if (classPdfs && classPdfs.length > 0) {
            await pdfModel.deleteMany({ _id: { $in: classPdfs } });
        }
        await userModel.updateMany(
            { classes: classId },
            { $pull: { classes: classId } }
        );
        await classesModel.findByIdAndDelete(classId);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
