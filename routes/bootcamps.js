const express = require("express");
const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require("../controllers/bootcamps");

// include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

// re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/:id/photo").put(bootcampPhotoUpload);

router
  .route("/")
  .get(getBootcamps)
  .post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

module.exports = router;
