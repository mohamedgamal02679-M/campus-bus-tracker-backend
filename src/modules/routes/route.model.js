const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
      minlength: [3, "Route name must be at least 3 characters"],
      maxlength: [100, "Route name must not exceed 100 characters"]
    },
    code: {
      type: String,
      required: [true, "Route code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, "Route code must be at least 2 characters"],
      maxlength: [20, "Route code must not exceed 20 characters"]
    },
    startLocationName: {
      type: String,
      required: [true, "Start location name is required"],
      trim: true,
      minlength: [2, "Start location name must be at least 2 characters"],
      maxlength: [100, "Start location name must not exceed 100 characters"]
    },
    endLocationName: {
      type: String,
      required: [true, "End location name is required"],
      trim: true,
      minlength: [2, "End location name must be at least 2 characters"],
      maxlength: [100, "End location name must not exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
      default: ""
    },
    estimatedDurationMinutes: {
      type: Number,
      min: [1, "Estimated duration must be at least 1 minute"],
      default: 15
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by admin is required"]
    }
  },
  {
    timestamps: true
  }
);

routeSchema.index({ name: 1 });
routeSchema.index({ isActive: 1, createdAt: -1 });

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;