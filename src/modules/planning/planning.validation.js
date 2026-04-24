const { body } = require("express-validator");

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

const planTripValidation = [
  body("fromStop")
    .notEmpty()
    .withMessage("From stop is required")
    .isMongoId()
    .withMessage("From stop must be a valid MongoDB ObjectId"),

  body("toStop")
    .notEmpty()
    .withMessage("To stop is required")
    .isMongoId()
    .withMessage("To stop must be a valid MongoDB ObjectId"),

  body("dayOfWeek")
    .notEmpty()
    .withMessage("Day of week is required")
    .isIn(DAYS_OF_WEEK)
    .withMessage("Day of week must be a valid weekday"),

  body("currentTime")
    .optional({ checkFalsy: true })
    .matches(TIME_PATTERN)
    .withMessage("Current time must be in HH:mm format"),

  body("direction")
    .optional()
    .isIn(SCHEDULE_DIRECTIONS)
    .withMessage("Direction must be outbound or return"),

  body("scheduleType")
    .optional()
    .isIn(SCHEDULE_TYPES)
    .withMessage("Schedule type must be regular or seasonal"),

  body("seasonLabel")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Season label must not exceed 100 characters")
    .trim(),

  body().custom((value) => {
    if (value.fromStop && value.toStop && value.fromStop === value.toStop) {
      throw new Error("From stop and to stop must be different");
    }

    return true;
  })
];

module.exports = {
  planTripValidation
};