const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const { authenticateToken } = require("../config/jwt");

router.route("/login")
    .post(controller.login);

router.route("/signup")
    .post(controller.signup);

router.route("/logout")
    .post(controller.logout);

router.route("/verify")
    .get(authenticateToken, controller.verifyToken);

router.route("/:email")
    .get(authenticateToken, controller.getUser)
    .put(authenticateToken, controller.updateUser)
    .delete(authenticateToken, controller.deleteUser);

module.exports = router;
