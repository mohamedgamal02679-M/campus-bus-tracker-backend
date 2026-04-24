const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const {
  getAllOperationLogs,
  getOperationLogById
} = require("./operationLog.service");

const getAll = asyncHandler(async (req, res) => {
  const result = await getAllOperationLogs(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Operation logs fetched successfully", result));
});

const getById = asyncHandler(async (req, res) => {
  const result = await getOperationLogById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Operation log fetched successfully", result));
});

module.exports = {
  getAll,
  getById
};