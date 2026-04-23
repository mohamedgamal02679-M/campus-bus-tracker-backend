const Route = require("./route.model");
const ApiError = require("../../utils/apiError");

const createRoute = async (payload, currentUser) => {
  const existingRoute = await Route.findOne({
    code: payload.code.toUpperCase()
  });

  if (existingRoute) {
    throw new ApiError(409, "Route code already exists");
  }

  const route = await Route.create({
    name: payload.name,
    code: payload.code.toUpperCase(),
    startLocationName: payload.startLocationName,
    endLocationName: payload.endLocationName,
    description: payload.description || "",
    estimatedDurationMinutes: payload.estimatedDurationMinutes || 15,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    createdBy: currentUser.id
  });

  return await Route.findById(route._id).populate(
    "createdBy",
    "fullName email role"
  );
};

const getAllRoutes = async (query = {}) => {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.code) {
    filter.code = query.code.toUpperCase();
  }

  if (query.name) {
    filter.name = { $regex: query.name, $options: "i" };
  }

  const routes = await Route.find(filter)
    .populate("createdBy", "fullName email role")
    .sort({ createdAt: -1 });

  return routes;
};

const getRouteById = async (routeId) => {
  const route = await Route.findById(routeId).populate(
    "createdBy",
    "fullName email role"
  );

  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  return route;
};

const updateRoute = async (routeId, payload) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  if (payload.code !== undefined) {
    const existingRoute = await Route.findOne({
      code: payload.code.toUpperCase(),
      _id: { $ne: routeId }
    });

    if (existingRoute) {
      throw new ApiError(409, "Route code already exists");
    }

    route.code = payload.code.toUpperCase();
  }

  if (payload.name !== undefined) route.name = payload.name;
  if (payload.startLocationName !== undefined) {
    route.startLocationName = payload.startLocationName;
  }
  if (payload.endLocationName !== undefined) {
    route.endLocationName = payload.endLocationName;
  }
  if (payload.description !== undefined) {
    route.description = payload.description;
  }
  if (payload.estimatedDurationMinutes !== undefined) {
    route.estimatedDurationMinutes = payload.estimatedDurationMinutes;
  }
  if (payload.isActive !== undefined) {
    route.isActive = payload.isActive;
  }

  await route.save();

  return await Route.findById(route._id).populate(
    "createdBy",
    "fullName email role"
  );
};

const deleteRoute = async (routeId) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  await route.deleteOne();

  return {
    id: route._id,
    name: route.name,
    code: route.code
  };
};

module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
};