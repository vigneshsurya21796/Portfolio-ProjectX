const express = require("express");
const app = express();
const cors = require("cors");
const cookieparser = require("cookie-parser");
const authrouter = require("./src/routes/auth.routes");
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieparser());
app.use(
  cors({
    origins: process.env.ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.get("/", (req, res) => {
  res.send("ProjectX");
});
app.use("api/v1/auth", authrouter);
module.exports = app;
