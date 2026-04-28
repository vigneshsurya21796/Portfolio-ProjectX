const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { morganMiddleware, logger } = require("./src/utils/logger");
const authroutes = require("./src/routes/auth.routes");
app.use(morganMiddleware);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("api/v1/auth", authroutes);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  logger.info("Root endpoint hit");
  res.send("Welcome to PORTFOlioX");
});

module.exports = app;
