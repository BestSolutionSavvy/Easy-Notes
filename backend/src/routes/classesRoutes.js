const express = require('express');
const router = express.Router();
const controller = require('../controllers/classesController');

router.route('/')
    .get(controller.listClasses)
    .post(controller.createClass);

router.route('/:id')
    .get(controller.getClassById)
    .put(controller.updateClass)
    .delete(controller.deleteClass);

module.exports = router;