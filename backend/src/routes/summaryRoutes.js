const express = require('express');
const router = express.Router();
const controller = require('../controllers/summaryController');
const { authenticateToken } = require("../config/jwt");

router.use(authenticateToken);

router.route('/:notebookId')
    .get(controller.getSummary)
    .post(controller.summarizeNotebook)
    .delete(controller.deleteSummary);

module.exports = router;
