const express = require("express");

const {
  addFavoriteValidation,
  removeFavoriteValidation
} = require("./favorite.validation");

const {
  add,
  getMine,
  remove
} = require("./favorite.controller");

const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  addFavoriteValidation,
  validate,
  add
);

router.get(
  "/me",
  authMiddleware,
  getMine
);

router.delete(
  "/:id",
  authMiddleware,
  removeFavoriteValidation,
  validate,
  remove
);

module.exports = router;