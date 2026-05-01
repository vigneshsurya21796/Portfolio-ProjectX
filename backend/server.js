const connectDB = require("./src/Config/db");
const app = require("./app");
const colors = require("colors");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", `.env.${process.env.NODE_ENV}`),
});
const PORT = process.env.PORT || 5000;
connectDB()
  .then((r) =>
    app.listen(PORT, (req, res) => {
      console.log(`server is running on PORT ${PORT}`.cyan.underline);
    }),
  )
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
