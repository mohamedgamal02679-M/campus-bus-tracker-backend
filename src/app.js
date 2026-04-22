const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Campus Bus Tracker backend is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API health check passed"
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
