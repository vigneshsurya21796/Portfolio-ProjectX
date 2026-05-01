const expressasynchandler = require("express-async-handler");
const User = require("../models/userModel");
// const register = expressasynchandler(async (req, res) => {});

const login = expressasynchandler(async (req, res) => {
  console.log(res);
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("enter all the of data");
  }
  const user = await User.findOne({ email });
  console.log(user);
});

module.exports = { register, login };
