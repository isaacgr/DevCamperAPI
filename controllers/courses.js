const Course = require("../models/Course");

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = (request, response, next) => {
  let query;
  if (request.params.bootcampId) {
    query = Course.find({ bootcamp: request.params.bootcampId });
  } else {
    query = Course.find();
  }
  query
    .then((courses) => {
      response.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    })
    .catch((error) => {
      next(error);
    });
};
