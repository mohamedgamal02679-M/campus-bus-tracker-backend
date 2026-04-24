const { param } = require("express-validator");

const getOperationLogByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Operation log id is required")
    .isMongoId()
    .withMessage("Operation log id must be a valid MongoDB ObjectId")
];

module.exports = {
  getOperationLogByIdValidation
};