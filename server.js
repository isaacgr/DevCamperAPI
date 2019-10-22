require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");

// connect to db
connectDB();

// route files
const bootcamps = require("./routes/bootcamps");

const app = express();
const port = process.env.PORT;

// middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use("/api/v1/bootcamps", bootcamps);

const server = app.listen(port, () => {
  console.log(
    `Server listening in ${process.env.NODE_ENV} on ${process.env.PORT}`
  );
});

// handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
