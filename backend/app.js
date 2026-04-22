/**
 * app.js — Express application factory
 *
 * This file is responsible for:
 *  1. Creating and configuring the Express instance
 *  2. Mounting global middleware (logging, body parsing, cookies, CORS)
 *  3. Mounting route handlers
 *
 * It does NOT start the HTTP server — that is done in index.js so that
 * the app can be imported and tested without binding a port.
 */

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// ─── Logging ─────────────────────────────────────────────────────────────────
/**
 * morganMiddleware : Express middleware that logs every HTTP request.
 *                   Internally it pipes to Winston so all logs are unified.
 * logger           : Winston instance for application-level logging
 *                    (errors, warnings, business events, etc.)
 */
const { morganMiddleware, logger } = require("./src/utils/logger");

// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// ─── 1. HTTP REQUEST LOGGING ──────────────────────────────────────────────────
/**
 * Mount Morgan FIRST so every request — including ones that might fail in
 * later middleware — is captured in the logs.
 */
app.use(morganMiddleware);

// ─── 2. BODY PARSERS ──────────────────────────────────────────────────────────
/**
 * Parse incoming JSON bodies.
 * limit:"16kb" protects against large payload attacks.
 */
app.use(express.json({ limit: "16kb" }));

/**
 * Parse URL-encoded form data (HTML forms, some REST clients).
 * extended:true allows nested objects in query strings.
 */
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ─── 3. COOKIE PARSER ────────────────────────────────────────────────────────
/**
 * Populates req.cookies with an object keyed by cookie name.
 * Required for JWT / session cookie auth flows.
 */
app.use(cookieParser());

// ─── 4. CORS ──────────────────────────────────────────────────────────────────
/**
 * TODO: uncomment and configure once the frontend origin is known.
 *
 * app.use(
 *   cors({
 *     origin: process.env.CLIENT_ORIGIN,   // e.g. "http://localhost:3000"
 *     credentials: true,                    // allow cookies cross-origin
 *     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
 *   })
 * );
 */

// ─── 5. ROUTES ────────────────────────────────────────────────────────────────

/**
 * Health-check endpoint.
 * Load-balancers / container orchestrators (ECS, k8s) ping this to verify
 * the service is alive.  Morgan is configured to skip logging this route
 * so it doesn't pollute your access logs.
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/** Root sanity check */
app.get("/", (req, res) => {
  logger.info("Root endpoint hit");
  res.send("PORTFOlioX");
});

// Mount feature routers here as the project grows, e.g.:
// const authRoutes = require("./src/routes/authroutes");
// app.use("/api/v1/auth", authRoutes);

// ─── 6. GLOBAL ERROR HANDLER ─────────────────────────────────────────────────
/**
 * Express calls this 4-parameter middleware whenever next(err) is invoked
 * or an async route throws (with express-async-handler wrapping routes).
 *
 * We log the full error here and respond with a clean JSON payload so
 * clients never receive an HTML error page or a raw stack trace.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only expose the stack trace in development — never in production
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

module.exports = app;
