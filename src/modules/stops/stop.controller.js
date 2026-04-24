const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const {
  createStop,
  getAllStops,
  getStopById,
  updateStop,
  deleteStop
} = require("./stop.service");

const buildRequestMeta = (req) => ({
  ipAddress: req.ip || "",
  userAgent: req.get("user-agent") || ""
});

const create = asyncHandler(async (req, res) => {
  const result = await createStop(req.body, req.user, buildRequestMeta(req));

  return res
    .status(201)
    .json(new ApiResponse(201, "Stop created successfully", result));
});

const getAll = asyncHandler(async (req, res) => {
  const result = await getAllStops(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Stops fetched successfully", result));
});

const getById = asyncHandler(async (req, res) => {
  const result = await getStopById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Stop fetched successfully", result));
});

const update = asyncHandler(async (req, res) => {
  const result = await updateStop(req.params.id, req.body, req.user, buildRequestMeta(req));

  return res
    .status(200)
    .json(new ApiResponse(200, "Stop updated successfully", result));
});

const remove = asyncHandler(async (req, res) => {
  const result = await deleteStop(req.params.id, req.user, buildRequestMeta(req));

  return res
    .status(200)
    .json(new ApiResponse(200, "Stop deleted successfully", result));
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};