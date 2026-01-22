const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.route("/login")
    .post(controller.login);

router.route("/signup")
    .post(controller.signup);

router.route("/:email")
    .get(controller.getUser)
    .put(controller.updateUser)
    .delete(controller.deleteUser);

module.exports = router;
