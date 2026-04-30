const path = require("path");
const envmode = process.env.NODE_ENV;
require("dotenv").config({
  path: path.join(__dirname, "..", `.env.${envmode}`),
});
const app = require("./app");
const connectDB = require("./src/Config/db.js");

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(
        `Server is running on PORT http://localhost:${PORT} on ${envmode} mode`,
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated!");
  });
});
