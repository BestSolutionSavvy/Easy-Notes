const express = require('express');
const router = express.Router();
const controller = require('../controllers/notebookController');
const { authenticateToken } = require("../config/jwt");

router.use(authenticateToken);

router.route('/:email')
    .get(controller.listNotebooks)
    .post(controller.createNotebook);

router.route('/:email/:id')
    .get(controller.getNotebookById)
    .post(controller.updateNotebook)
    .delete(controller.deleteNotebook);

module.exports = router;
