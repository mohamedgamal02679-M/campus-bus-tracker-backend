const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const {
  registerUser,
  loginUser,
  getCurrentUser
} = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", result));
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful", result));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", user));
});

module.exports = {
  register,
  login,
  getMe
};