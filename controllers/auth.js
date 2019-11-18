const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Register user
// @route   GET /api/v1/auth
// @access  Public
exports.register = (request, response, next) => {
  const { name, email, password, role } = request.body;

  // create user
  User.create({
    name,
    email,
    password,
    role
  })
    .then(user => {
      //create token
      const token = user.getSignedJwtToken();
      response.status(200).json({ success: true, token });
    })
    .catch(error => {
      next(error);
    });
};
