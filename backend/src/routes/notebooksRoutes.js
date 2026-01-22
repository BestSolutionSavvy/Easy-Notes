const express = require('express');
const router = express.Router();
const controller = require('../controllers/notebookController');

router.route('/')
    .get(controller.listNotebooks)
    .post(controller.createNotebook);

router.route('/:username/:id')
    .get(controller.getNotebookById)
    .post(controller.updateNotebook)
    .delete(controller.deleteNotebook);

module.exports = router;
