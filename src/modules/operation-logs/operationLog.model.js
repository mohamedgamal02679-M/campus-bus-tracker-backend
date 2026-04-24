const mongoose = require("mongoose");

const OPERATION_ACTIONS = [
  "create",
  "update",
  "delete",
  "login",
  "register",
  "plan_trip",
  "system_action",
  "read"
];

const ENTITY_TYPES = [
  "auth",
  "announcement",
  "route",
  "stop",
  "schedule",
  "favorite",
  "planning",
  "system"
];

const LOG_STATUSES = ["success", "failed"];

const operationLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    actorRole: {
      type: String,
      trim: true,
      default: ""
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: OPERATION_ACTIONS
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      enum: ENTITY_TYPES
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    details: {
      type: String,
      trim: true,
      maxlength: [1000, "Details must not exceed 1000 characters"],
      default: ""
    },
    status: {
      type: String,
      enum: LOG_STATUSES,
      default: "success"
    },
    ipAddress: {
      type: String,
      trim: true,
      default: ""
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, "User agent must not exceed 500 characters"],
      default: ""
    }
  },
  {
    timestamps: true
  }
);

operationLogSchema.index({ actor: 1, createdAt: -1 });
operationLogSchema.index({ entityType: 1, createdAt: -1 });
operationLogSchema.index({ action: 1, createdAt: -1 });
operationLogSchema.index({ status: 1, createdAt: -1 });

const OperationLog = mongoose.model("OperationLog", operationLogSchema);

module.exports = OperationLog;