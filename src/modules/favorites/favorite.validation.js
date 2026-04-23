const { body, param } = require("express-validator");

const addFavoriteValidation = [
  body("stop")
    .notEmpty()
    .withMessage("Stop is required")
    .isMongoId()
    .withMessage("Stop must be a valid MongoDB ObjectId"),

  body("notes")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Notes must not exceed 300 characters")
    .trim()
];

const removeFavoriteValidation = [
  param("id")
    .notEmpty()
    .withMessage("Favorite id is required")
    .isMongoId()
    .withMessage("Favorite id must be a valid MongoDB ObjectId")
];

module.exports = {
  addFavoriteValidation,
  removeFavoriteValidation
};