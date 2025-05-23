const winston = require("winston");
const path = require("path");

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Tell winston about the colors
winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.stack ? "\n" + info.stack : ""
      }${
        info.meta && Object.keys(info.meta).length > 0
          ? "\n" + JSON.stringify(info.meta, null, 2)
          : ""
      }`
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format,
  }),

  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/error.log"),
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/combined.log"),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Enhanced logging methods with metadata support
const enhancedLogger = {
  error: (message, meta = {}) => {
    logger.error(message, { meta });
  },
  warn: (message, meta = {}) => {
    logger.warn(message, { meta });
  },
  info: (message, meta = {}) => {
    logger.info(message, { meta });
  },
  http: (message, meta = {}) => {
    logger.http(message, { meta });
  },
  debug: (message, meta = {}) => {
    logger.debug(message, { meta });
  },
  stream: logger.stream,
};

module.exports = enhancedLogger;
