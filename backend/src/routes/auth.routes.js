const express = require("express");
const { login, Register } = require("../contorllers/Authcontroller");
const router = express.Router();
router.route("/login").get(login);
router.route("/Registe").get(Register);
module.exports = router;
