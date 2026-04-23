const { body } = require("express-validator");
const { ANNOUNCEMENT_PRIORITIES } = require("../../utils/constants");

const ANNOUNCEMENT_SCOPES = ["general", "route", "stop"];

const createAnnouncementValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters")
    .trim(),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Message must be between 5 and 1000 characters")
    .trim(),

  body("priority")
    .optional()
    .isIn(ANNOUNCEMENT_PRIORITIES)
    .withMessage("Priority must be low, medium, or high"),

  body("scope")
    .optional()
    .isIn(ANNOUNCEMENT_SCOPES)
    .withMessage("Scope must be general, route, or stop"),

  body("relatedRoute")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("relatedRoute must be a valid MongoDB ObjectId"),

  body("relatedStop")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("relatedStop must be a valid MongoDB ObjectId"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body("startsAt")
    .optional()
    .isISO8601()
    .withMessage("startsAt must be a valid date"),

  body("endsAt")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("endsAt must be a valid date"),

  body().custom((value) => {
    const scope = value.scope || "general";

    if (scope === "route" && !value.relatedRoute) {
      throw new Error("relatedRoute is required when scope is route");
    }

    if (scope === "stop" && !value.relatedStop) {
      throw new Error("relatedStop is required when scope is stop");
    }

    if (value.endsAt && value.startsAt) {
      const startsAt = new Date(value.startsAt);
      const endsAt = new Date(value.endsAt);

      if (endsAt <= startsAt) {
        throw new Error("endsAt must be later than startsAt");
      }
    }

    return true;
  })
];

const updateAnnouncementValidation = [
  body("title")
    .optional()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters")
    .trim(),

  body("message")
    .optional()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Message must be between 5 and 1000 characters")
    .trim(),

  body("priority")
    .optional()
    .isIn(ANNOUNCEMENT_PRIORITIES)
    .withMessage("Priority must be low, medium, or high"),

  body("scope")
    .optional()
    .isIn(ANNOUNCEMENT_SCOPES)
    .withMessage("Scope must be general, route, or stop"),

  body("relatedRoute")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("relatedRoute must be a valid MongoDB ObjectId"),

  body("relatedStop")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("relatedStop must be a valid MongoDB ObjectId"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body("startsAt")
    .optional()
    .isISO8601()
    .withMessage("startsAt must be a valid date"),

  body("endsAt")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("endsAt must be a valid date"),

  body().custom((value) => {
    if (value.scope === "route" && !value.relatedRoute) {
      throw new Error("relatedRoute is required when scope is route");
    }

    if (value.scope === "stop" && !value.relatedStop) {
      throw new Error("relatedStop is required when scope is stop");
    }

    if (value.endsAt && value.startsAt) {
      const startsAt = new Date(value.startsAt);
      const endsAt = new Date(value.endsAt);

      if (endsAt <= startsAt) {
        throw new Error("endsAt must be later than startsAt");
      }
    }

    return true;
  })
];

module.exports = {
  createAnnouncementValidation,
  updateAnnouncementValidation
};