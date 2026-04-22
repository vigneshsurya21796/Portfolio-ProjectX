/**
 * logger.js — Centralised Winston + Morgan logging utility
 *
 * WHY TWO LIBRARIES?
 *  - Winston  : application-level logger (errors, warnings, info, debug).
 *               Writes structured JSON to files in production so log aggregators
 *               (Datadog, CloudWatch, ELK) can parse them easily.
 *  - Morgan   : HTTP request logger middleware for Express.
 *               It hooks into every incoming request and pipes a one-line
 *               summary (method, URL, status, response-time) into Winston so
 *               ALL logs end up in the same place / files.
 *
 * ENVIRONMENT BEHAVIOUR
 *  development → pretty, colourised console output (easy to read while coding)
 *  production  → silent console, structured JSON written to rotating log files
 */

const { createLogger, format, transports } = require("winston");
const morgan = require("morgan");
const path = require("path");

// ─────────────────────────────────────────────
// 1. WINSTON FORMATS
// ─────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== "production";

/**
 * Development format:
 *  [TIMESTAMP]  LEVEL : message  { optional meta }
 *  Colourised so different log levels stand out in the terminal.
 */
const devFormat = format.combine(
  format.colorize({ all: true }),           // add ANSI colours per level
  format.timestamp({ format: "HH:mm:ss" }), // short time — date is implied in dev
  format.printf(({ timestamp, level, message, ...meta }) => {
    // Only append meta when it actually has keys (keeps output clean)
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `[${timestamp}]  ${level} : ${message}${metaStr}`;
  })
);

/**
 * Production format:
 *  Pure JSON with a full ISO timestamp.
 *  { "timestamp":"...", "level":"info", "message":"...", ...meta }
 *  Log shippers / aggregators parse this without any extra config.
 */
const prodFormat = format.combine(
  format.timestamp(),   // ISO-8601 full date+time
  format.errors({ stack: true }), // include stack trace when an Error is logged
  format.json()         // serialise everything as JSON
);

// ─────────────────────────────────────────────
// 2. TRANSPORTS  (where logs are written)
// ─────────────────────────────────────────────

/**
 * Logs directory lives at  backend/logs/
 * Winston does NOT create the directory itself — we rely on the OS/deploy
 * pipeline to create it, or you can add `fs.mkdirSync` here if preferred.
 */
const LOG_DIR = path.join(__dirname, "../../logs");

const productionTransports = [
  /**
   * combined.log  → every log level (info and above)
   * Rotate / archive this file with a tool like logrotate or
   * winston-daily-rotate-file in larger projects.
   */
  new transports.File({
    filename: path.join(LOG_DIR, "combined.log"),
    level: "info",
  }),

  /**
   * error.log  → ONLY error-level logs
   * Keeps a clean, high-signal file you can alert on separately.
   */
  new transports.File({
    filename: path.join(LOG_DIR, "error.log"),
    level: "error",
  }),
];

// In development we also want to see everything in the terminal.
const developmentTransports = [
  new transports.Console(),
];

// ─────────────────────────────────────────────
// 3. CREATE THE WINSTON LOGGER INSTANCE
// ─────────────────────────────────────────────

const logger = createLogger({
  /**
   * Log level hierarchy (lowest → highest severity):
   *  error > warn > info > http > verbose > debug > silly
   *
   * "http"  captures Morgan's request lines.
   * "debug" is useful during development; suppressed in production.
   */
  level: isDev ? "debug" : "http",

  format: isDev ? devFormat : prodFormat,

  transports: isDev ? developmentTransports : productionTransports,

  /**
   * Don't crash the process on unhandled rejections / exceptions —
   * log them instead. Winston's built-in handlers cover this.
   */
  exitOnError: false,
});

// ─────────────────────────────────────────────
// 4. MORGAN → WINSTON BRIDGE
// ─────────────────────────────────────────────

/**
 * Morgan needs a Node.js writable stream.
 * We create a minimal stream object whose `write` method
 * forwards each line to Winston at the "http" level.
 * The trailing newline that Morgan appends is stripped with .trim().
 */
const morganStream = {
  write: (message) => logger.http(message.trim()),
};

/**
 * Morgan format strings:
 *  "dev"      → colourised, short  (great for development terminals)
 *  "combined" → Apache combined log format (standard for production)
 *
 * We pick the right one per environment automatically.
 */
const morganMiddleware = morgan(isDev ? "dev" : "combined", {
  stream: morganStream,

  /**
   * skip option: do NOT log health-check requests so they don't
   * flood your log files.  Adjust the path to match your health endpoint.
   */
  skip: (req) => req.url === "/health",
});

// ─────────────────────────────────────────────
// 5. EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  /**
   * logger  — use this anywhere in the app:
   *   const { logger } = require("../utils/logger");
   *   logger.info("User registered", { userId: user._id });
   *   logger.error("DB connection failed", { error });
   */
  logger,

  /**
   * morganMiddleware — Express middleware, mount once in app.js:
   *   const { morganMiddleware } = require("./src/utils/logger");
   *   app.use(morganMiddleware);
   */
  morganMiddleware,
};
