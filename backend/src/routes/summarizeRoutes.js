const express = require('express');
const router = express.Router();
const controller = require('../controllers/summarizeController');
const { authenticateToken } = require("../config/jwt");

router.use(authenticateToken);

router.route('/')
    .post(controller.summarizeText);

module.exports = router;
