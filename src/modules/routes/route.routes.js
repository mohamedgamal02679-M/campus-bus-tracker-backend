const express = require("express");

const {
  createRouteValidation,
  updateRouteValidation
} = require("./route.validation");

const {
  create,
  getAll,
  getById,
  update,
  remove
} = require("./route.controller");

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
  createRouteValidation,
  validate,
  create
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  updateRouteValidation,
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