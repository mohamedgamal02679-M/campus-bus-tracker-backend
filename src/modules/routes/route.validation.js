const { body } = require("express-validator");

const createRouteValidation = [
  body("name")
    .notEmpty()
    .withMessage("Route name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Route name must be between 3 and 100 characters")
    .trim(),

  body("code")
    .notEmpty()
    .withMessage("Route code is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Route code must be between 2 and 20 characters")
    .trim()
    .toUpperCase(),

  body("startLocationName")
    .notEmpty()
    .withMessage("Start location name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Start location name must be between 2 and 100 characters")
    .trim(),

  body("endLocationName")
    .notEmpty()
    .withMessage("End location name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("End location name must be between 2 and 100 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .trim(),

  body("estimatedDurationMinutes")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Estimated duration must be a number greater than or equal to 1"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false")
];

const updateRouteValidation = [
  body("name")
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("Route name must be between 3 and 100 characters")
    .trim(),

  body("code")
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage("Route code must be between 2 and 20 characters")
    .trim()
    .toUpperCase(),

  body("startLocationName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Start location name must be between 2 and 100 characters")
    .trim(),

  body("endLocationName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("End location name must be between 2 and 100 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .trim(),

  body("estimatedDurationMinutes")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Estimated duration must be a number greater than or equal to 1"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false")
];

module.exports = {
  createRouteValidation,
  updateRouteValidation
};