const express = require("express");
const router = express.Router();
const { register, login } = require("../contorllers/authcontroller");
router.route("/login").post(login);
router.route("/register").post(register);
module.exports = router;
