const errorMiddleware = (error, req, res, next) => {
  console.error("Error:", error.message);
  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
};

module.exports = errorMiddleware;
