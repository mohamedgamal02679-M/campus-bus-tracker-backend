const express = require("express");

const {
  createScheduleValidation,
  updateScheduleValidation
} = require("./schedule.validation");

const {
  create,
  getAll,
  getById,
  update,
  remove
} = require("./schedule.controller");

const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const { USER_ROLES } = require("../../utils/constants");

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  createScheduleValidation,
  validate,
  create
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  updateScheduleValidation,
  validate,
  update
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  remove
);

module.exports = router;