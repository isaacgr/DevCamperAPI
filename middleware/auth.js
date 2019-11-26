const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// protect routes
exports.protect = (request, response, next) => {
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  } else if (request.cookies.token) {
    token = request.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.id)
      .then(user => {
        request.user = user;
        next();
      })
      .catch(error => {
        throw error;
      });
  } catch (error) {
    return next(new ErrorResponse("Not authorized", 401));
  }
};
