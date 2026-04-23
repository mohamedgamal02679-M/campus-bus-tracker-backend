const mongoose = require("mongoose");

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

const SCHEDULE_DIRECTIONS = ["outbound", "return"];
const SCHEDULE_TYPES = ["regular", "seasonal"];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const scheduleSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route is required"]
    },
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: [true, "Stop is required"]
    },
    dayOfWeek: {
      type: String,
      required: [true, "Day of week is required"],
      enum: DAYS_OF_WEEK
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required"],
      match: [TIME_PATTERN, "Departure time must be in HH:mm format"]
    },
    arrivalTime: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          return !value || TIME_PATTERN.test(value);
        },
        message: "Arrival time must be in HH:mm format"
      }
    },
    direction: {
      type: String,
      enum: SCHEDULE_DIRECTIONS,
      default: "outbound"
    },
    scheduleType: {
      type: String,
      enum: SCHEDULE_TYPES,
      default: "regular"
    },
    seasonLabel: {
      type: String,
      trim: true,
      maxlength: [100, "Season label must not exceed 100 characters"],
      default: "default"
    },
    effectiveFrom: {
      type: Date,
      default: null
    },
    effectiveTo: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes must not exceed 500 characters"],
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

scheduleSchema.pre("validate", function () {
  if (this.scheduleType === "regular" && !this.seasonLabel) {
    this.seasonLabel = "default";
  }

  if (this.effectiveFrom && this.effectiveTo && this.effectiveTo <= this.effectiveFrom) {
    throw new Error("effectiveTo must be later than effectiveFrom");
  }
});

scheduleSchema.index(
  {
    route: 1,
    stop: 1,
    dayOfWeek: 1,
    departureTime: 1,
    direction: 1,
    seasonLabel: 1
  },
  { unique: true }
);

scheduleSchema.index({ route: 1, stop: 1, dayOfWeek: 1, isActive: 1 });
scheduleSchema.index({ stop: 1, dayOfWeek: 1, departureTime: 1 });

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;