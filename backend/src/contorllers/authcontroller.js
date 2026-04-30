const expressasynchandler = require("express-async-handler");

const register = expressasynchandler(async (req, res) => {});

const login = expressasynchandler(async (req, res) => {
  const { email, password } = req.body;
});

module.exports = { register, login };
