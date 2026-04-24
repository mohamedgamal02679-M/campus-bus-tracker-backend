const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
} = require("./schedule.service");

const buildRequestMeta = (req) => ({
  ipAddress: req.ip || "",
  userAgent: req.get("user-agent") || ""
});

const create = asyncHandler(async (req, res) => {
  const result = await createSchedule(req.body, req.user, buildRequestMeta(req));

  return res
    .status(201)
    .json(new ApiResponse(201, "Schedule created successfully", result));
});

const getAll = asyncHandler(async (req, res) => {
  const result = await getAllSchedules(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Schedules fetched successfully", result));
});

const getById = asyncHandler(async (req, res) => {
  const result = await getScheduleById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Schedule fetched successfully", result));
});

const update = asyncHandler(async (req, res) => {
  const result = await updateSchedule(req.params.id, req.body, req.user, buildRequestMeta(req));

  return res
    .status(200)
    .json(new ApiResponse(200, "Schedule updated successfully", result));
});

const remove = asyncHandler(async (req, res) => {
  const result = await deleteSchedule(req.params.id, req.user, buildRequestMeta(req));

  return res
    .status(200)
    .json(new ApiResponse(200, "Schedule deleted successfully", result));
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};