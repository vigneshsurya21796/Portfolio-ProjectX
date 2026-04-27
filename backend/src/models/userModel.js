const mongoose = require("mongoose");
const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name"],
  },
  email: {
    type: String,
    required: [true, "Please enter the email"],
  },
  password: {
    type: String,
    required: [true, "Plese enter the password"],
  },
});

export const User = mongoose.model("user", userschema);
userschema.pre("save", (next) => {});
