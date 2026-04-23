const Favorite = require("./favorite.model");
const Stop = require("../stops/stop.model");
const ApiError = require("../../utils/apiError");

const addFavorite = async (payload, currentUser) => {
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

  return await Favorite.findById(favorite._id)
    .populate("user", "fullName email role")
    .populate("stop", "name code order locationName address latitude longitude isActive")
    .populate("route", "name code startLocationName endLocationName isActive");
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

const removeFavorite = async (favoriteId, userId) => {
  const favorite = await Favorite.findOne({
    _id: favoriteId,
    user: userId
  });

  if (!favorite) {
    throw new ApiError(404, "Favorite not found");
  }

  await favorite.deleteOne();

  return {
    id: favorite._id,
    stop: favorite.stop,
    route: favorite.route
  };
};

module.exports = {
  addFavorite,
  getMyFavorites,
  removeFavorite
};