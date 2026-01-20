const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.route("/")
    .get(controller.getUser)
    .put(controller.updateUser)
    .delete(controller.deleteUser);

router.route("/login")
    .post(controller.login);

router.route("/signup")
    .post(controller.signup);

module.exports = router;
