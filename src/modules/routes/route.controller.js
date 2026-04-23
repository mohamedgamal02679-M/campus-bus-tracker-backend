const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
} = require("./route.service");

const create = asyncHandler(async (req, res) => {
  const result = await createRoute(req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, "Route created successfully", result));
});

const getAll = asyncHandler(async (req, res) => {
  const result = await getAllRoutes(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Routes fetched successfully", result));
});

const getById = asyncHandler(async (req, res) => {
  const result = await getRouteById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Route fetched successfully", result));
});

const update = asyncHandler(async (req, res) => {
  const result = await updateRoute(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Route updated successfully", result));
});

const remove = asyncHandler(async (req, res) => {
  const result = await deleteRoute(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Route deleted successfully", result));
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};