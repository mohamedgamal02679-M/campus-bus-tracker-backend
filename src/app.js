const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./modules/auth/auth.routes");
const announcementRoutes = require("./modules/announcements/announcement.routes");
const routeRoutes = require("./modules/routes/route.routes");
const stopRoutes = require("./modules/stops/stop.routes");

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

app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/stops", stopRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;