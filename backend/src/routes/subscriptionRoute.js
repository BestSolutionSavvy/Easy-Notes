const express = require("express");
const router = express.Router();
const controller = require("../controllers/subscriptionController");
const { authenticateToken } = require("../config/jwt");

router.use(authenticateToken);

router.post("/subscribe", controller.subscribe);
router.delete("/subscribe", controller.unsubscribe);
router.post("/test", controller.testNotification);

module.exports = router;
