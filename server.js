require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const morgan = require("morgan");

// route files
const bootcamps = require("./routes/bootcamps");

const app = express();
const port = process.env.PORT;

// middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/bootcamps", bootcamps);

app.listen(port, () => {
  console.log(
    `Server listening in ${process.env.NODE_ENV} on ${process.env.PORT}`
  );
});
