const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (request, response, next) => {
  Bootcamp.find()
    .then((bootcamps) => {
      response
        .status(200)
        .json({ success: true, count: bootcamps.length, data: bootcamps });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (request, response, next) => {
  Bootcamp.findById(request.params.id)
    .then((bootcamp) => {
      response.status(200).json({ success: true, data: bootcamp });
    })
    .catch((error) => {
      next(error);
    });
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
    .then((bootcamp) => {
      response.status(200).json({ success: true, data: bootcamp });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:iddeleteBootcamp
// @access  Private
exports.deleteBootcamp = (request, response, next) => {
  Bootcamp.findByIdAndDelete(request.params.id)
    .then((bootcamp) => {
      response.status(200).json({ success: true, data: bootcamp });
    })
    .catch((error) => {
      next(error);
    });
};

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsInRadius = (request, response, next) => {
  const { zipcode, distance } = request.params;

  // get lat/long from geocoder
  geocoder.geocode(zipcode).then((loc) => {
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
      .then((bootcamps) => {
        response
          .status(200)
          .json({ success: true, count: bootcamps.length, data: bootcamps });
      })
      .catch((error) => {
        next(error);
      });
  });
};
