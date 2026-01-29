const express = require('express');
const router = express.Router();
const controller = require('../controllers/classController');
const { authenticateToken } = require("../config/jwt");

router.use(authenticateToken);

router.route('/')
    .get(controller.listClasses)
    .post(controller.createClass);

router.route('/:id')
    .get(controller.getClassById)
    .put(controller.updateClass)
    .delete(controller.deleteClass);

router.route('/:id/lecture')
    .post(controller.uploadPdfToClass);

module.exports = router;