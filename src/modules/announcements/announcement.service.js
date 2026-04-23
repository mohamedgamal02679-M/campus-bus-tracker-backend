const Announcement = require("./announcement.model");
const ApiError = require("../../utils/apiError");

const createAnnouncement = async (payload, currentUser) => {
  const announcement = await Announcement.create({
    title: payload.title,
    message: payload.message,
    priority: payload.priority || "medium",
    scope: payload.scope || "general",
    relatedRoute: payload.relatedRoute || null,
    relatedStop: payload.relatedStop || null,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    startsAt: payload.startsAt || new Date(),
    endsAt: payload.endsAt || null,
    createdBy: currentUser.id
  });

  return await Announcement.findById(announcement._id)
    .populate("createdBy", "fullName email role")
    .populate("relatedRoute")
    .populate("relatedStop");
};

const getAllAnnouncements = async (query = {}) => {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.scope) {
    filter.scope = query.scope;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.relatedRoute) {
    filter.relatedRoute = query.relatedRoute;
  }

  if (query.relatedStop) {
    filter.relatedStop = query.relatedStop;
  }

  const announcements = await Announcement.find(filter)
    .populate("createdBy", "fullName email role")
    .populate("relatedRoute")
    .populate("relatedStop")
    .sort({ createdAt: -1 });

  return announcements;
};

const getAnnouncementById = async (announcementId) => {
  const announcement = await Announcement.findById(announcementId)
    .populate("createdBy", "fullName email role")
    .populate("relatedRoute")
    .populate("relatedStop");

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return announcement;
};

const updateAnnouncement = async (announcementId, payload) => {
  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  if (payload.title !== undefined) announcement.title = payload.title;
  if (payload.message !== undefined) announcement.message = payload.message;
  if (payload.priority !== undefined) announcement.priority = payload.priority;
  if (payload.scope !== undefined) announcement.scope = payload.scope;
  if (payload.relatedRoute !== undefined) announcement.relatedRoute = payload.relatedRoute || null;
  if (payload.relatedStop !== undefined) announcement.relatedStop = payload.relatedStop || null;
  if (payload.isActive !== undefined) announcement.isActive = payload.isActive;
  if (payload.startsAt !== undefined) announcement.startsAt = payload.startsAt;
  if (payload.endsAt !== undefined) announcement.endsAt = payload.endsAt || null;

  await announcement.save();

  return await Announcement.findById(announcement._id)
    .populate("createdBy", "fullName email role")
    .populate("relatedRoute")
    .populate("relatedStop");
};

const deleteAnnouncement = async (announcementId) => {
  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  await announcement.deleteOne();

  return {
    id: announcement._id,
    title: announcement.title
  };
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
};