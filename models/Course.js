const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Must include a title"]
  },
  description: {
    type: String,
    required: [true, "Must include a description"]
  },
  weeks: {
    type: String,
    required: [true, "Must include duration of the course (in weeks)"]
  },
  tuition: {
    type: Number,
    required: [true, "Must include a tuition cost"]
  },
  minimumSkill: {
    type: String,
    required: [true, "Must include a minimum skill requirement"],
    enum: ["beginner", "intermediate", "advanced"]
  },
  scholarshipAvailable: {
    type: Boolean,
    required: false
  },
  createdAt: {
    type: Date,
    date: Date.now()
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true
  }
});

module.exports = mongoose.model("Course", CourseSchema);
