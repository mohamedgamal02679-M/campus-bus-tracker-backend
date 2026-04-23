const { body } = require("express-validator");

const createStopValidation = [
  body("name")
    .notEmpty()
    .withMessage("Stop name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Stop name must be between 2 and 100 characters")
    .trim(),

  body("code")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 20 })
    .withMessage("Stop code must be between 2 and 20 characters")
    .trim()
    .toUpperCase(),

  body("route")
    .notEmpty()
    .withMessage("Route is required")
    .isMongoId()
    .withMessage("Route must be a valid MongoDB ObjectId"),

  body("order")
    .notEmpty()
    .withMessage("Stop order is required")
    .isInt({ min: 1 })
    .withMessage("Stop order must be an integer greater than or equal to 1"),

  body("locationName")
    .notEmpty()
    .withMessage("Location name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Location name must be between 2 and 150 characters")
    .trim(),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 3, max: 300 })
    .withMessage("Address must be between 3 and 300 characters")
    .trim(),

  body("latitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid number between -90 and 90"),

  body("longitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid number between -180 and 180"),

  body("displayAddress")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Display address must not exceed 500 characters")
    .trim(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body().custom((value) => {
    const hasLatitude = value.latitude !== undefined && value.latitude !== "";
    const hasLongitude = value.longitude !== undefined && value.longitude !== "";

    if ((hasLatitude && !hasLongitude) || (!hasLatitude && hasLongitude)) {
      throw new Error("latitude and longitude must be provided together");
    }

    return true;
  })
];

const updateStopValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Stop name must be between 2 and 100 characters")
    .trim(),

  body("code")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 20 })
    .withMessage("Stop code must be between 2 and 20 characters")
    .trim()
    .toUpperCase(),

  body("route")
    .optional()
    .isMongoId()
    .withMessage("Route must be a valid MongoDB ObjectId"),

  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Stop order must be an integer greater than or equal to 1"),

  body("locationName")
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage("Location name must be between 2 and 150 characters")
    .trim(),

  body("address")
    .optional()
    .isLength({ min: 3, max: 300 })
    .withMessage("Address must be between 3 and 300 characters")
    .trim(),

  body("latitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid number between -90 and 90"),

  body("longitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid number between -180 and 180"),

  body("displayAddress")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Display address must not exceed 500 characters")
    .trim(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body().custom((value) => {
    const hasLatitude = value.latitude !== undefined && value.latitude !== "";
    const hasLongitude = value.longitude !== undefined && value.longitude !== "";

    if ((hasLatitude && !hasLongitude) || (!hasLatitude && hasLongitude)) {
      throw new Error("latitude and longitude must be provided together");
    }

    return true;
  })
];

module.exports = {
  createStopValidation,
  updateStopValidation
};