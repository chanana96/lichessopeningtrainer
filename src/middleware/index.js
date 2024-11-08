const authMiddleware = require("./auth.middleware");
const errorMiddleware = require("./error.middleware");
const loggerMiddleware = require("./logger.middleware");

module.exports = {
  authMiddleware,
  errorMiddleware,
  loggerMiddleware,
};
