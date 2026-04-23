const express = require("express");

const {
  createAnnouncementValidation,
  updateAnnouncementValidation
} = require("./announcement.validation");

const {
  create,
  getAll,
  getById,
  update,
  remove
} = require("./announcement.controller");

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
  createAnnouncementValidation,
  validate,
  create
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  updateAnnouncementValidation,
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