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

CourseSchema.statics.getAverageCost = function(bootcampId) {
  console.log("Calculating average cost");
  this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" }
      }
    }
  ])
    .then((obj) => {
      this.model("Bootcamp")
        .findByIdAndUpdate(bootcampId, {
          averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
        .then((result) => {
          console.log("Updated bootcamp with average cost");
        })
        .catch((error) => {
          throw error;
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

// Call getAverageCost after save
CourseSchema.post("save", function() {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre("remove", function() {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
