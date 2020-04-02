const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = (request, response, next) => {
  response.status(200).json(response.advancedResults);
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = (request, response, next) => {
  const user = User.findById(request.params.id);
  user.then((user) => {
    response
      .status(200)
      .json({
        success: true,
        data: user
      })
      .catch((error) => {
        next(error);
      });
  });
};

// @desc    Create a single user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = (request, response, next) => {
  const user = User.create(request.body);
  user
    .then((user) => {
      response.status(201).json({
        success: true,
        data: user
      });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = (request, response, next) => {
  const user = User.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  });
  user
    .then((user) => {
      response.status(200).json({
        success: true,
        data: user
      });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = (request, response, next) => {
  const user = User.findByIdAndDelete(request.params.id);
  user
    .then((user) => {
      response.status(200).json({
        success: true,
        data: {}
      });
    })
    .catch((error) => {
      next(error);
    });
};
