const logger = require("../utils/logger");

module.exports = (err, _req, res, _next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
};
