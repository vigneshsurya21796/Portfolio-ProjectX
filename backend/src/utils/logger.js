const { createLogger, format, transports } = require("winston");
const morgan = require("morgan");
const path = require("path");

const isDev = process.env.NODE_ENV !== "production";

const devFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: "HH:mm:ss" }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `[${timestamp}]  ${level} : ${message}${metaStr}`;
  })
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const LOG_DIR = path.join(__dirname, "../../logs");

const productionTransports = [
  new transports.File({
    filename: path.join(LOG_DIR, "combined.log"),
    level: "info",
  }),
  new transports.File({
    filename: path.join(LOG_DIR, "error.log"),
    level: "error",
  }),
];

const developmentTransports = [
  new transports.Console(),
];

const logger = createLogger({
  level: isDev ? "debug" : "http",
  format: isDev ? devFormat : prodFormat,
  transports: isDev ? developmentTransports : productionTransports,
  exitOnError: false,
});

const morganStream = {
  write: (message) => logger.http(message.trim()),
};

const morganMiddleware = morgan(isDev ? "dev" : "combined", {
  stream: morganStream,
  skip: (req) => req.url === "/health",
});

module.exports = {
  logger,
  morganMiddleware,
};
