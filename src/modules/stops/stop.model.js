const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Stop name is required"],
      trim: true,
      minlength: [2, "Stop name must be at least 2 characters"],
      maxlength: [100, "Stop name must not exceed 100 characters"]
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: [2, "Stop code must be at least 2 characters"],
      maxlength: [20, "Stop code must not exceed 20 characters"],
      unique: true,
      sparse: true
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route is required"]
    },
    order: {
      type: Number,
      required: [true, "Stop order is required"],
      min: [1, "Stop order must be at least 1"]
    },
    locationName: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
      minlength: [2, "Location name must be at least 2 characters"],
      maxlength: [150, "Location name must not exceed 150 characters"]
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [3, "Address must be at least 3 characters"],
      maxlength: [300, "Address must not exceed 300 characters"]
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be greater than or equal to -90"],
      max: [90, "Latitude must be less than or equal to 90"]
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be greater than or equal to -180"],
      max: [180, "Longitude must be less than or equal to 180"]
    },
    displayAddress: {
      type: String,
      trim: true,
      maxlength: [500, "Display address must not exceed 500 characters"],
      default: ""
    },
    geocodingSource: {
      type: String,
      default: "nominatim",
      trim: true
    },
    osmPlaceId: {
      type: String,
      default: ""
    },
    osmType: {
      type: String,
      default: ""
    },
    osmId: {
      type: String,
      default: ""
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

stopSchema.index({ route: 1, order: 1 }, { unique: true });
stopSchema.index({ route: 1, isActive: 1 });
stopSchema.index({ name: 1 });
stopSchema.index({ locationName: 1 });

const Stop = mongoose.model("Stop", stopSchema);

module.exports = Stop;