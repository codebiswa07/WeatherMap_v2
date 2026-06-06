const { createLogger, format, transports } = require("winston");

module.exports = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
  ),
  transports: [new transports.Console()],
});
