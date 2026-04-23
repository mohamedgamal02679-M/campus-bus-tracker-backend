const express = require("express");

const {
  registerValidation,
  loginValidation
} = require("./auth.validation");

const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");

const {
  register,
  login,
  getMe
} = require("./auth.controller");

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", authMiddleware, getMe);

module.exports = router;