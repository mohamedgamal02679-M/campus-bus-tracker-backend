const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} = require("./announcement.service");

const create = asyncHandler(async (req, res) => {
  const result = await createAnnouncement(req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, "Announcement created successfully", result));
});

const getAll = asyncHandler(async (req, res) => {
  const result = await getAllAnnouncements(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Announcements fetched successfully", result));
});

const getById = asyncHandler(async (req, res) => {
  const result = await getAnnouncementById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Announcement fetched successfully", result));
});

const update = asyncHandler(async (req, res) => {
  const result = await updateAnnouncement(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Announcement updated successfully", result));
});

const remove = asyncHandler(async (req, res) => {
  const result = await deleteAnnouncement(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Announcement deleted successfully", result));
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};