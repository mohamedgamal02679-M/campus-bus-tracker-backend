const express = require("express");

const { planTripValidation } = require("./planning.validation");
const { plan } = require("./planning.controller");

const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/trip",
  authMiddleware,
  planTripValidation,
  validate,
  plan
);

module.exports = router;