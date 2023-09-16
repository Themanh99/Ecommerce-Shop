const compression = require("compression");
require("dotenv").config();
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// TODO: init middleware
app.use(morgan("combined"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
//template engine

// TODO: init db
require("./dbs/init.mongodb");
// const { countConnect, checkOverload } = require("./helpers/check.connect");
// checkOverload();
// countConnect();

// TODO: init routes
app.use("/", require("./routes"));

// TODO: handing error
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});
module.exports = app;
