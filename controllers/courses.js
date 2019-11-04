const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = (request, response, next) => {
  let query;
  if (request.params.bootcampId) {
    query = Course.find({ bootcamp: request.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description"
    });
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

// @desc    Get a single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = (request, response, next) => {
  const course = Course.findById(request.params.id)
    .populate({
      path: "bootcamp",
      select: "name description"
    })
    .then((course) => {
      return course;
    });
  course
    .then((course) => {
      response.status(200).json({
        success: true,
        data: course
      });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Add a course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = (request, response, next) => {
  request.body.bootcamp = request.params.bootcampId;
  const bootcamp = Bootcamp.findById(request.params.bootcampId)
    .populate({
      path: "bootcamp",
      select: "name description"
    })
    .then((bootcamp) => {
      return Course.create(request.body);
    });
  bootcamp
    .then((course) => {
      response.status(200).json({
        success: true,
        data: course
      });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = (request, response, next) => {
  const course = Course.findById(request.params.id).then((course) => {
    return Course.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });
  });
  course
    .then((course) => {
      response.status(200).json({
        success: true,
        data: course
      });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Delete a course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = (request, response, next) => {
  const course = Course.findById(request.params.id).then((course) => {
    return course.remove();
  });
  course
    .then((course) => {
      response.status(200).json({
        success: true,
        data: course
      });
    })
    .catch((error) => {
      next(error);
    });
};
