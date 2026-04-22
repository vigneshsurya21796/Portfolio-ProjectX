/**
 * index.js — Application entry point
 *
 * Responsibilities:
 *  - Load environment variables from .env BEFORE anything else
 *  - Start the HTTP server and bind to the configured PORT
 *  - Log startup info via Winston (not console.log)
 *
 * Kept intentionally thin — all Express setup lives in app.js so this
 * file can be skipped during automated tests that import app directly.
 */

const app = require("./app");
const dotenv = require("dotenv");

// Must be called before importing anything that reads process.env
dotenv.config({ path: `.env` });

// Import logger AFTER dotenv so NODE_ENV is already set when logger.js
// evaluates the isDev flag and picks the right format/transports.
const { logger } = require("./src/utils/logger");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  /**
   * Use logger.info instead of console.log so startup messages land in the
   * same log file / stream as all other application logs.
   * In production this emits structured JSON; in dev it is colourised text.
   */
  logger.info(`Server started`, {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});
