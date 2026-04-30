const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userschema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide us a name"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Plese enter email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  {
    timestamps: true,
  },
);
userschema.pre("save", async function (next) {
  if (!this.isModified(this.password)) return next();
  this.passsword = await bcrypt.hash(this.password, 10);
  next();
});
userschema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userschema.methods.generateaccesstoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};
userschema.methods.generaterefreshtoken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15d",
    },
  );
};
userschema.methods.generatetemprorytoken = function () {
  const unhashedtoken = crypto.randomBytes(20).toString("hex");
  const hashedtoken = crypto
    .createHash("sha256")
    .update(unhashedtoken)
    .digest("hex");
  const tokenexpiry = Date.now() + 20 * 60 * 1000;
  return {
    unhashedtoken,
    hashedtoken,
    tokenexpiry,
  };
};
const User = mongoose.model("User", userschema);
module.exports = User;
