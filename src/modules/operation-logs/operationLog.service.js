const OperationLog = require("./operationLog.model");
const ApiError = require("../../utils/apiError");

const createOperationLog = async ({
  actor = null,
  actorRole = "",
  action,
  entityType,
  entityId = null,
  details = "",
  status = "success",
  ipAddress = "",
  userAgent = ""
}) => {
  try {
    return await OperationLog.create({
      actor,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      status,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error("Failed to create operation log:", error.message);
    return null;
  }
};

const getAllOperationLogs = async (query = {}) => {
  const filter = {};

  if (query.actor) {
    filter.actor = query.actor;
  }

  if (query.actorRole) {
    filter.actorRole = query.actorRole;
  }

  if (query.action) {
    filter.action = query.action;
  }

  if (query.entityType) {
    filter.entityType = query.entityType;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const logs = await OperationLog.find(filter)
    .populate("actor", "fullName email role")
    .sort({ createdAt: -1 });

  return logs;
};

const getOperationLogById = async (logId) => {
  const log = await OperationLog.findById(logId).populate(
    "actor",
    "fullName email role"
  );

  if (!log) {
    throw new ApiError(404, "Operation log not found");
  }

  return log;
};

module.exports = {
  createOperationLog,
  getAllOperationLogs,
  getOperationLogById
};