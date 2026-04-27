const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { morganMiddleware, logger } = require("./src/utils/logger");

const app = express();

app.use(morganMiddleware);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   })
// );

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  logger.info("Root endpoint hit");
  res.send("PORTFOlioX");
});

module.exports = app;
