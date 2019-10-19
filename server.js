require("dotenv").config({ path: "./config/config.env" });
const express = require("express");

const app = express();
const port = process.env.PORT;

app.listen(port, () => {
  console.log(
    `Server listening in ${process.env.NODE_ENV} on ${process.env.PORT}`
  );
});
