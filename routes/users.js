const express = require("express");
const {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/users");
const { protect, authorize } = require("../middleware/auth");
const Users = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });

router.use(protect, authorize("publisher", "admin"));

router
  .route("/")
  .get(advancedResults(Users), getUsers)
  .post(createUser);

router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
