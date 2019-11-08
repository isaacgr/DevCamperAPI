require("dotenv").config({ path: "./config/config.env" });
const fs = require("fs");
const mongoose = require("mongoose");

const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

// Import into database
const importData = () => {
  Bootcamp.create(bootcamps)
    .then(() => {
      console.log("Bootcamp database seeded");
      // process.exit();
    })
    .catch((error) => {
      console.log(error);
    });
  Course.create(courses)
    .then(() => {
      console.log("Course database seeded");
      // process.exit();
    })
    .catch((error) => {
      console.log(error);
    });
};

// delete data
const deleteData = () => {
  Bootcamp.deleteMany()
    .then(() => {
      console.log("Bootcamp database destroyed");
      // process.exit();
    })
    .catch((error) => {
      console.log(error);
    });
  Course.deleteMany()
    .then(() => {
      console.log("Course database destroyed");
      // process.exit();
    })
    .catch((error) => {
      console.log(error);
    });
};

if (process.argv[2] === "--delete") {
  deleteData();
} else if (process.argv[2] === "--import") {
  importData();
}
