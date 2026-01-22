const express = require('express');
const router = express.Router();
const controller = require('../controllers/summarizeController');

router.route('/')
    .post(controller.summarizeText);


module.exports = router;
