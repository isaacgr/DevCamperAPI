const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (error, request, response, next) => {
  console.log(error.stack);

  let errorResponse = error;

  if (error.name === "CastError") {
    const message = `Resource not found with id ${error.value}`;
    errorResponse = new ErrorResponse(message, 404);
  }

  if (error.code === 11000) {
    const message = `Duplicate field value entered`;
    errorResponse = new ErrorResponse(message, 400);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors).map((value) => value.message);
    errorResponse = new ErrorResponse(message, 400);
  }

  response
    .status(errorResponse.statusCode || 500)
    .json({ success: false, error: errorResponse.message || "Server error" });
};

module.exports = errorHandler;
