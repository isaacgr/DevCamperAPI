const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = (request, response, next) => {
  if (request.params.bootcampId) {
    Course.find({ bootcamp: request.params.bootcampId }).then((courses) =>
      response.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      })
    );
  } else {
    response.status(200).json(response.advancedResults);
  }
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
      if (
        bootcamp.user.toString() !== request.user.id &&
        request.user.role !== "admin"
      ) {
        throw new ErrorResponse(
          "You do not have permission to preform this action"
        );
      }
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
      if (
        course.user.toString() !== request.user.id &&
        request.user.role !== "admin"
      ) {
        throw new ErrorResponse(
          "You do not have permission to preform this action"
        );
      }
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
      if (
        course.user.toString() !== request.user.id &&
        request.user.role !== "admin"
      ) {
        throw new ErrorResponse(
          "You do not have permission to preform this action"
        );
      }
      response.status(200).json({
        success: true,
        data: course
      });
    })
    .catch((error) => {
      next(error);
    });
};
