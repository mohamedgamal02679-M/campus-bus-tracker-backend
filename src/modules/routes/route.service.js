const Route = require("./route.model");
const ApiError = require("../../utils/apiError");
const { createOperationLog } = require("../operation-logs/operationLog.service");

const createRoute = async (payload, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;
  const normalizedCode = payload.code.toUpperCase();

  const existingRoute = await Route.findOne({
    code: normalizedCode
  });

  if (existingRoute) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "create",
      entityType: "route",
      entityId: null,
      details: `Failed to create route with code ${normalizedCode}: code already exists`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(409, "Route code already exists");
  }

  const route = await Route.create({
    name: payload.name,
    code: normalizedCode,
    startLocationName: payload.startLocationName,
    endLocationName: payload.endLocationName,
    description: payload.description || "",
    estimatedDurationMinutes: payload.estimatedDurationMinutes || 15,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    createdBy: currentUser.id
  });

  await createOperationLog({
    actor: currentUser.id,
    actorRole: currentUser.role,
    action: "create",
    entityType: "route",
    entityId: route._id,
    details: `Created route ${route.code} successfully`,
    status: "success",
    ipAddress,
    userAgent
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

const updateRoute = async (routeId, payload, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;

  const route = await Route.findById(routeId);

  if (!route) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "update",
      entityType: "route",
      entityId: null,
      details: `Failed to update route ${routeId}: route not found`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(404, "Route not found");
  }

  if (payload.code !== undefined) {
    const existingRoute = await Route.findOne({
      code: payload.code.toUpperCase(),
      _id: { $ne: routeId }
    });

    if (existingRoute) {
      await createOperationLog({
        actor: currentUser.id,
        actorRole: currentUser.role,
        action: "update",
        entityType: "route",
        entityId: route._id,
        details: `Failed to update route ${route.code}: target code ${payload.code.toUpperCase()} already exists`,
        status: "failed",
        ipAddress,
        userAgent
      });

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

  await createOperationLog({
    actor: currentUser.id,
    actorRole: currentUser.role,
    action: "update",
    entityType: "route",
    entityId: route._id,
    details: `Updated route ${route.code} successfully`,
    status: "success",
    ipAddress,
    userAgent
  });

  return await Route.findById(route._id).populate(
    "createdBy",
    "fullName email role"
  );
};

const deleteRoute = async (routeId, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;

  const route = await Route.findById(routeId);

  if (!route) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "delete",
      entityType: "route",
      entityId: null,
      details: `Failed to delete route ${routeId}: route not found`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(404, "Route not found");
  }

  const deletedRouteCode = route.code;
  const deletedRouteId = route._id;

  await route.deleteOne();

  await createOperationLog({
    actor: currentUser.id,
    actorRole: currentUser.role,
    action: "delete",
    entityType: "route",
    entityId: deletedRouteId,
    details: `Deleted route ${deletedRouteCode} successfully`,
    status: "success",
    ipAddress,
    userAgent
  });

  return {
    id: deletedRouteId,
    name: route.name,
    code: deletedRouteCode
  };
};

module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
};