const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const { planTrip } = require("./planning.service");

const plan = asyncHandler(async (req, res) => {
  const result = await planTrip(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Trip planning completed successfully", result));
});

module.exports = {
  plan
};