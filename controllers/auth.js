const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Register user
// @route   GET /api/v1/auth
// @access  Public
exports.register = (request, response, next) => {
  response.status(200).json({ success: true });
  next();
};
