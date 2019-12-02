const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (request, response, next) => {
  const reqQuery = { ...request.query };

  // fields to exclude
  const removeFields = ["select", "sort", "page", "limit", "skip"];
  removeFields.forEach(field => delete reqQuery[field]);

  let query = JSON.stringify(reqQuery);
  query = query.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  query = JSON.parse(query);

  let dbQuery = Bootcamp.find(query).populate("courses");

  if (request.query.select) {
    const fields = request.query.select.split(",").join(" ");
    dbQuery = dbQuery.select(fields);
  }

  if (request.query.sort) {
    const sortBy = request.query.sort.split(",").join(" ");
    dbQuery = dbQuery.sort(sortBy);
  } else {
    dbQuery = dbQuery.sort("-createdAt");
  }

  // pagination
  let pagination = {};

  const page = parseInt(request.query.page, 10) || 1;
  const limit = parseInt(request.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  Bootcamp.countDocuments()
    .then(result => {
      const total = result;
      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit
        };
      } else if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit
        };
      } else {
        pagination.lastPage = true;
      }
      return true;
    })
    .then(() => {
      dbQuery = dbQuery.skip(startIndex).limit(limit);

      dbQuery
        .then(bootcamps => {
          response.status(200).json({
            success: true,
            count: bootcamps.length,
            pagination,
            data: bootcamps
          });
        })
        .catch(error => {
          next(error);
        });
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (request, response, next) => {
  Bootcamp.findById(request.params.id)
    .then(bootcamp => {
      response.status(200).json({ success: true, data: bootcamp });
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = (request, response, next) => {
  // Add user to request body
  request.body.user = request.user.id;

  // check for published bootcamp
  Bootcamp.findOne({ user: request.user.id })
    .then(bootcamps => {
      if (bootcamps && request.user.role !== "admin") {
        throw new ErrorResponse("Already published a bootcamp");
      }
      return bootcamps;
    })
    .then(() => {
      Bootcamp.create(request.body)
        .then(bootcamp => {
          response.status(201).json({ success: true, data: bootcamp });
        })
        .catch(error => {
          next(error);
        });
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (request, response, next) => {
  Bootcamp.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  })
    .then(bootcamp => {
      if (
        bootcamp.user.toString() !== request.user.id &&
        request.user.role !== "admin"
      ) {
        throw new ErrorResponse(
          "You do not have permission to preform this action"
        );
      }
      response.status(200).json({ success: true, data: bootcamp });
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (request, response, next) => {
  Bootcamp.findById(request.params.id)
    .then(bootcamp => {
      if (
        bootcamp.user.toString() !== request.user.id &&
        request.user.role !== "admin"
      ) {
        throw new ErrorResponse(
          "You do not have permission to preform this action"
        );
      }
      bootcamp.remove();
      response.status(200).json({ success: true, data: bootcamp });
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsInRadius = (request, response, next) => {
  const { zipcode, distance } = request.params;

  // get lat/long from geocoder
  geocoder.geocode(zipcode).then(loc => {
    const lat = loc[0].latitude;
    const long = loc[0].longitude;
    const radius = distance / 3963;
    Bootcamp.find({
      location: {
        $geoWithin: {
          $centerSphere: [[long, lat], radius]
        }
      }
    })
      .then(bootcamps => {
        response
          .status(200)
          .json({ success: true, count: bootcamps.length, data: bootcamps });
      })
      .catch(error => {
        next(error);
      });
  });
};

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = (request, response, next) => {
  if (!request.files) {
    next(new ErrorResponse("Please upload a file", 400));
  }
  const file = request.files.file;

  // make sure image is photo
  if (!file.mimetype.startsWith("image")) {
    next(new ErrorResponse("Please upload a valid photo", 400));
  }
  // check file size
  if (file.size > process.env.MAX_FILE_SIZE) {
    next(new ErrorResponse("Photo too large", 400));
  }

  Bootcamp.findById(request.params.id)
    .then(bootcamp => {
      if (
        bootcamp.user.toString() !== request.user.id &&
        request.user.role !== "admin"
      ) {
        throw new ErrorResponse(
          "You do not have permission to preform this action"
        );
      }
      // create a custom filename
      const filename = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
      file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, error => {
        if (error) {
          console.log(error);
          return next(new ErrorResponse("Problem with file upload", 500));
        }
        Bootcamp.findByIdAndUpdate(request.params.id, { photo: filename }).then(
          () => {
            response.status(200).json({ success: true, data: file.name });
          }
        );
      });
    })
    .catch(error => {
      next(error);
    });
};
