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

const createScheduleValidation = [
  body("route")
    .notEmpty()
    .withMessage("Route is required")
    .isMongoId()
    .withMessage("Route must be a valid MongoDB ObjectId"),

  body("stop")
    .notEmpty()
    .withMessage("Stop is required")
    .isMongoId()
    .withMessage("Stop must be a valid MongoDB ObjectId"),

  body("dayOfWeek")
    .notEmpty()
    .withMessage("Day of week is required")
    .isIn(DAYS_OF_WEEK)
    .withMessage("Day of week must be a valid weekday"),

  body("departureTime")
    .notEmpty()
    .withMessage("Departure time is required")
    .matches(TIME_PATTERN)
    .withMessage("Departure time must be in HH:mm format"),

  body("arrivalTime")
    .optional({ checkFalsy: true })
    .matches(TIME_PATTERN)
    .withMessage("Arrival time must be in HH:mm format"),

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

  body("effectiveFrom")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("effectiveFrom must be a valid date"),

  body("effectiveTo")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("effectiveTo must be a valid date"),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters")
    .trim(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body().custom((value) => {
    if (value.effectiveFrom && value.effectiveTo) {
      const effectiveFrom = new Date(value.effectiveFrom);
      const effectiveTo = new Date(value.effectiveTo);

      if (effectiveTo <= effectiveFrom) {
        throw new Error("effectiveTo must be later than effectiveFrom");
      }
    }

    return true;
  })
];

const updateScheduleValidation = [
  body("route")
    .optional()
    .isMongoId()
    .withMessage("Route must be a valid MongoDB ObjectId"),

  body("stop")
    .optional()
    .isMongoId()
    .withMessage("Stop must be a valid MongoDB ObjectId"),

  body("dayOfWeek")
    .optional()
    .isIn(DAYS_OF_WEEK)
    .withMessage("Day of week must be a valid weekday"),

  body("departureTime")
    .optional()
    .matches(TIME_PATTERN)
    .withMessage("Departure time must be in HH:mm format"),

  body("arrivalTime")
    .optional({ checkFalsy: true })
    .matches(TIME_PATTERN)
    .withMessage("Arrival time must be in HH:mm format"),

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

  body("effectiveFrom")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("effectiveFrom must be a valid date"),

  body("effectiveTo")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("effectiveTo must be a valid date"),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters")
    .trim(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body().custom((value) => {
    if (value.effectiveFrom && value.effectiveTo) {
      const effectiveFrom = new Date(value.effectiveFrom);
      const effectiveTo = new Date(value.effectiveTo);

      if (effectiveTo <= effectiveFrom) {
        throw new Error("effectiveTo must be later than effectiveFrom");
      }
    }

    return true;
  })
];

module.exports = {
  createScheduleValidation,
  updateScheduleValidation
};