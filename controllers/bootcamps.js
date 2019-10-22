const Bootcamp = require("../models/Bootcamp");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (request, response, next) => {
  response.status(200).json({ success: true, message: "Show all bootcamps" });
};

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (request, response, next) => {
  response
    .status(200)
    .json({ success: true, message: `Show bootcamp ${request.params.id}` });
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = (request, response, next) => {
  Bootcamp.create(request.body)
    .then((bootcamp) => {
      response.status(201).json({ success: true, data: bootcamp });
    })
    .catch((error) => {
      response.status(500).json({
        success: false,
        error: error
      });
    });
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (request, response, next) => {
  response
    .status(200)
    .json({ success: true, message: `Update bootcamp ${request.params.id}` });
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (request, response, next) => {
  response
    .status(200)
    .json({ success: true, message: `Delete bootcamp ${request.params.id}` });
};
