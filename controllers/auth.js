const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Register user
// @route   POST /api/v1/auth
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
      sendTokenResponse(user, 200, response);
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Register user
// @route   POST /api/v1/auth
// @access  Public
exports.login = (request, response, next) => {
  const { email, password } = request.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // get user
  User.findOne({
    email
  })
    .select("+password")
    .then(user => {
      //check if password matches
      user
        .matchPassword(password)
        .then(isMatch => {
          if (!isMatch) {
            next(new ErrorResponse("Invalid credentials", 401));
          }
          sendTokenResponse(user, 200, response);
        })
        .catch(error => {
          next(new ErrorResponse("Invalid credentials", 401));
        });
    })
    .catch(error => {
      next(new ErrorResponse("Invalid credentials", 401));
    });
};

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, response) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false
  };

  response
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
