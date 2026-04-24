const Favorite = require("./favorite.model");
const Stop = require("../stops/stop.model");
const ApiError = require("../../utils/apiError");
const { createOperationLog } = require("../operation-logs/operationLog.service");

const addFavorite = async (payload, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;

  try {
    const stop = await Stop.findById(payload.stop).populate(
      "route",
      "name code startLocationName endLocationName isActive"
    );

    if (!stop) {
      throw new ApiError(404, "Stop not found");
    }

    const existingFavorite = await Favorite.findOne({
      user: currentUser.id,
      stop: stop._id
    });

    if (existingFavorite) {
      throw new ApiError(409, "This stop is already in your favorites");
    }

    const favorite = await Favorite.create({
      user: currentUser.id,
      stop: stop._id,
      route: stop.route._id,
      notes: payload.notes || ""
    });

    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "create",
      entityType: "favorite",
      entityId: favorite._id,
      details: `Added stop ${stop.name} to favorites successfully`,
      status: "success",
      ipAddress,
      userAgent
    });

    return await Favorite.findById(favorite._id)
      .populate("user", "fullName email role")
      .populate("stop", "name code order locationName address latitude longitude isActive")
      .populate("route", "name code startLocationName endLocationName isActive");
  } catch (error) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "create",
      entityType: "favorite",
      entityId: null,
      details: `Failed to add favorite: ${error.message}`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw error;
  }
};

const getMyFavorites = async (userId, query = {}) => {
  const filter = {
    user: userId
  };

  if (query.route) {
    filter.route = query.route;
  }

  const favorites = await Favorite.find(filter)
    .populate("stop", "name code order locationName address latitude longitude isActive")
    .populate("route", "name code startLocationName endLocationName isActive")
    .sort({ createdAt: -1 });

  return favorites;
};

const removeFavorite = async (favoriteId, userId, requestMeta = {}, currentUserRole = "") => {
  const { ipAddress = "", userAgent = "" } = requestMeta;
  let favorite = null;

  try {
    favorite = await Favorite.findOne({
      _id: favoriteId,
      user: userId
    })
      .populate("stop", "name code")
      .populate("route", "name code");

    if (!favorite) {
      throw new ApiError(404, "Favorite not found");
    }

    const deletedFavoriteId = favorite._id;
    const stopName = favorite.stop?.name || "";
    const routeCode = favorite.route?.code || "";

    await favorite.deleteOne();

    await createOperationLog({
      actor: userId,
      actorRole: currentUserRole,
      action: "delete",
      entityType: "favorite",
      entityId: deletedFavoriteId,
      details: `Removed favorite successfully${stopName ? ` for stop ${stopName}` : ""}${routeCode ? ` on route ${routeCode}` : ""}`,
      status: "success",
      ipAddress,
      userAgent
    });

    return {
      id: deletedFavoriteId,
      stop: favorite.stop,
      route: favorite.route
    };
  } catch (error) {
    await createOperationLog({
      actor: userId,
      actorRole: currentUserRole,
      action: "delete",
      entityType: "favorite",
      entityId: favorite?._id || null,
      details: `Failed to remove favorite ${favoriteId}: ${error.message}`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw error;
  }
};

module.exports = {
  addFavorite,
  getMyFavorites,
  removeFavorite
};