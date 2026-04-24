const Announcement = require("./announcement.model");
const Route = require("../routes/route.model");
const Stop = require("../stops/stop.model");
const User = require("../auth/auth.model");
const ApiError = require("../../utils/apiError");
const { USER_ROLES } = require("../../utils/constants");
const { sendAnnouncementEmail } = require("../../integrations/email/brevo.service");

const parseManualRecipients = () => {
  const raw = process.env.ANNOUNCEMENT_EMAIL_RECIPIENTS || "";

  if (!raw.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
};

const getAnnouncementRecipients = async () => {
  const manualRecipients = parseManualRecipients();

  if (manualRecipients.length > 0) {
    return manualRecipients;
  }

  const riders = await User.find({ role: USER_ROLES.RIDER }).select(
    "fullName email"
  );

  return riders
    .filter((user) => user.email)
    .map((user) => ({
      email: user.email,
      name: user.fullName || ""
    }));
};

const resolveAnnouncementTargets = async (payload) => {
  let relatedRoute = null;
  let relatedStop = null;

  if (payload.scope === "route") {
    if (!payload.relatedRoute) {
      throw new ApiError(400, "relatedRoute is required when scope is route");
    }

    const route = await Route.findById(payload.relatedRoute);

    if (!route) {
      throw new ApiError(404, "Route not found");
    }

    relatedRoute = route._id;
  }

  if (payload.scope === "stop") {
    if (!payload.relatedStop) {
      throw new ApiError(400, "relatedStop is required when scope is stop");
    }

    const stop = await Stop.findById(payload.relatedStop).populate(
      "route",
      "name code"
    );

    if (!stop) {
      throw new ApiError(404, "Stop not found");
    }

    relatedStop = stop._id;
  }

  return {
    relatedRoute,
    relatedStop
  };
};

const createAnnouncement = async (payload, currentUser) => {
  const targets = await resolveAnnouncementTargets(payload);

  const announcement = await Announcement.create({
    title: payload.title,
    message: payload.message,
    priority: payload.priority || "medium",
    scope: payload.scope || "general",
    relatedRoute: targets.relatedRoute,
    relatedStop: targets.relatedStop,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    startsAt: payload.startsAt || new Date(),
    endsAt: payload.endsAt || null,
    createdBy: currentUser.id
  });

  const populatedAnnouncement = await Announcement.findById(announcement._id)
    .populate("relatedRoute", "name code startLocationName endLocationName isActive")
    .populate("relatedStop", "name code order locationName address isActive")
    .populate("createdBy", "fullName email role");

  let emailDelivery = {
    status: "skipped",
    recipientCount: 0,
    reason: "No recipients available"
  };

  try {
    const recipients = await getAnnouncementRecipients();

    if (recipients.length > 0) {
      await sendAnnouncementEmail({
        recipients,
        title: populatedAnnouncement.title,
        message: populatedAnnouncement.message,
        priority: populatedAnnouncement.priority,
        scope: populatedAnnouncement.scope
      });

      emailDelivery = {
        status: "sent",
        recipientCount: recipients.length,
        provider: "brevo"
      };
    }
  } catch (error) {
    emailDelivery = {
      status: "failed",
      recipientCount: 0,
      provider: "brevo",
      error: error.message
    };
  }

  return {
    announcement: populatedAnnouncement,
    emailDelivery
  };
};

const getAllAnnouncements = async (query = {}) => {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.scope) {
    filter.scope = query.scope;
  }

  if (query.relatedRoute) {
    filter.relatedRoute = query.relatedRoute;
  }

  if (query.relatedStop) {
    filter.relatedStop = query.relatedStop;
  }

  if (query.title) {
    filter.title = { $regex: query.title, $options: "i" };
  }

  return Announcement.find(filter)
    .populate("relatedRoute", "name code startLocationName endLocationName isActive")
    .populate("relatedStop", "name code order locationName address isActive")
    .populate("createdBy", "fullName email role")
    .sort({ createdAt: -1 });
};

const getAnnouncementById = async (announcementId) => {
  const announcement = await Announcement.findById(announcementId)
    .populate("relatedRoute", "name code startLocationName endLocationName isActive")
    .populate("relatedStop", "name code order locationName address isActive")
    .populate("createdBy", "fullName email role");

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

  const mergedPayload = {
    title: payload.title !== undefined ? payload.title : announcement.title,
    message: payload.message !== undefined ? payload.message : announcement.message,
    priority: payload.priority !== undefined ? payload.priority : announcement.priority,
    scope: payload.scope !== undefined ? payload.scope : announcement.scope,
    relatedRoute:
      payload.relatedRoute !== undefined ? payload.relatedRoute : announcement.relatedRoute,
    relatedStop:
      payload.relatedStop !== undefined ? payload.relatedStop : announcement.relatedStop,
    isActive: payload.isActive !== undefined ? payload.isActive : announcement.isActive,
    startsAt: payload.startsAt !== undefined ? payload.startsAt : announcement.startsAt,
    endsAt: payload.endsAt !== undefined ? payload.endsAt : announcement.endsAt
  };

  const targets = await resolveAnnouncementTargets(mergedPayload);

  announcement.title = mergedPayload.title;
  announcement.message = mergedPayload.message;
  announcement.priority = mergedPayload.priority;
  announcement.scope = mergedPayload.scope;
  announcement.relatedRoute = targets.relatedRoute;
  announcement.relatedStop = targets.relatedStop;
  announcement.isActive = mergedPayload.isActive;
  announcement.startsAt = mergedPayload.startsAt;
  announcement.endsAt = mergedPayload.endsAt;

  await announcement.save();

  return Announcement.findById(announcement._id)
    .populate("relatedRoute", "name code startLocationName endLocationName isActive")
    .populate("relatedStop", "name code order locationName address isActive")
    .populate("createdBy", "fullName email role");
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