const body = require("express-validator");
const uservalidator = () => {
  return [body("email").trim()];
};
