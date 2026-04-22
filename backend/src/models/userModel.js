const mongoose = require("mongoose");
const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name"],
  },
});

export const User = mongoose.model("user", userschema);
