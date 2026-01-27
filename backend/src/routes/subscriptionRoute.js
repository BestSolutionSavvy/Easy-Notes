const express = require("express");
const router = express.Router();
const controller = require("../controllers/subscriptionController");
const { authenticateToken } = require("../config/jwt");

router.use(authenticateToken);

router.post("/subscribe", controller.subscribe);
router.post("/unsubscribe", controller.unsubscribe);

module.exports = router;
