const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const {
  addFavorite,
  getMyFavorites,
  removeFavorite
} = require("./favorite.service");

const buildRequestMeta = (req) => ({
  ipAddress: req.ip || "",
  userAgent: req.get("user-agent") || ""
});

const add = asyncHandler(async (req, res) => {
  const result = await addFavorite(req.body, req.user, buildRequestMeta(req));

  return res
    .status(201)
    .json(new ApiResponse(201, "Favorite added successfully", result));
});

const getMine = asyncHandler(async (req, res) => {
  const result = await getMyFavorites(req.user.id, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Favorites fetched successfully", result));
});

const remove = asyncHandler(async (req, res) => {
  const result = await removeFavorite(
    req.params.id,
    req.user.id,
    buildRequestMeta(req),
    req.user.role
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Favorite removed successfully", result));
});

module.exports = {
  add,
  getMine,
  remove
};