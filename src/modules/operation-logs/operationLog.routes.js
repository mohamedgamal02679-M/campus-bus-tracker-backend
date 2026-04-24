const express = require("express");

const {
  getOperationLogByIdValidation
} = require("./operationLog.validation");

const {
  getAll,
  getById
} = require("./operationLog.controller");

const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const { USER_ROLES } = require("../../utils/constants");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  getAll
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  getOperationLogByIdValidation,
  validate,
  getById
);

module.exports = router;