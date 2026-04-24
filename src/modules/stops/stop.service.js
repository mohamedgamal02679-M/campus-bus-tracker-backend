const Stop = require("./stop.model");
const Route = require("../routes/route.model");
const ApiError = require("../../utils/apiError");
const { createOperationLog } = require("../operation-logs/operationLog.service");
const { geocodeStopLocation } = require("../../integrations/nominatim/nominatim.service");

const resolveStopCoordinates = async (payload, existingStop = null) => {
  const hasLatitude =
    payload.latitude !== undefined &&
    payload.latitude !== null &&
    payload.latitude !== "";

  const hasLongitude =
    payload.longitude !== undefined &&
    payload.longitude !== null &&
    payload.longitude !== "";

  if ((hasLatitude && !hasLongitude) || (!hasLatitude && hasLongitude)) {
    throw new ApiError(400, "latitude and longitude must be provided together");
  }

  
  if (hasLatitude && hasLongitude) {
    return {
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      displayAddress:
        payload.displayAddress !== undefined
          ? payload.displayAddress
          : existingStop?.displayAddress || "",
      geocodingSource: "manual",
      osmPlaceId: existingStop?.osmPlaceId || "",
      osmType: existingStop?.osmType || "",
      osmId: existingStop?.osmId || ""
    };
  }

  const resolvedLocationName =
    payload.locationName !== undefined
      ? payload.locationName
      : existingStop?.locationName || "";

  const resolvedAddress =
    payload.address !== undefined
      ? payload.address
      : existingStop?.address || "";

  const shouldGeocode =
    !existingStop ||
    payload.locationName !== undefined ||
    payload.address !== undefined;

  if (shouldGeocode) {
    return await geocodeStopLocation({
      locationName: resolvedLocationName,
      address: resolvedAddress
    });
  }

  if (existingStop) {
    return {
      latitude: existingStop.latitude,
      longitude: existingStop.longitude,
      displayAddress: existingStop.displayAddress || "",
      geocodingSource: existingStop.geocodingSource || "nominatim",
      osmPlaceId: existingStop.osmPlaceId || "",
      osmType: existingStop.osmType || "",
      osmId: existingStop.osmId || ""
    };
  }

  throw new ApiError(400, "Could not resolve stop coordinates");
};

const createStop = async (payload, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;

  try {
    const route = await Route.findById(payload.route);

    if (!route) {
      throw new ApiError(404, "Route not found");
    }

    if (payload.code) {
      const existingCode = await Stop.findOne({
        code: payload.code.toUpperCase()
      });

      if (existingCode) {
        throw new ApiError(409, "Stop code already exists");
      }
    }

    const existingOrder = await Stop.findOne({
      route: payload.route,
      order: payload.order
    });

    if (existingOrder) {
      throw new ApiError(
        409,
        "A stop with the same order already exists in this route"
      );
    }

    const coordinates = await resolveStopCoordinates(payload);

    const stop = await Stop.create({
      name: payload.name,
      code: payload.code ? payload.code.toUpperCase() : undefined,
      route: payload.route,
      order: payload.order,
      locationName: payload.locationName,
      address: payload.address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      displayAddress: coordinates.displayAddress,
      geocodingSource: coordinates.geocodingSource,
      osmPlaceId: coordinates.osmPlaceId,
      osmType: coordinates.osmType,
      osmId: coordinates.osmId,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      createdBy: currentUser.id
    });

    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "create",
      entityType: "stop",
      entityId: stop._id,
      details: `Created stop ${stop.name} successfully in route ${route.code} using ${coordinates.geocodingSource} geocoding`,
      status: "success",
      ipAddress,
      userAgent
    });

    return await Stop.findById(stop._id)
      .populate("route", "name code startLocationName endLocationName isActive")
      .populate("createdBy", "fullName email role");
  } catch (error) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "create",
      entityType: "stop",
      entityId: null,
      details: `Failed to create stop ${payload.name || ""}: ${error.message}`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw error;
  }
};

const getAllStops = async (query = {}) => {
  const filter = {};

  if (query.route) {
    filter.route = query.route;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.name) {
    filter.name = { $regex: query.name, $options: "i" };
  }

  if (query.code) {
    filter.code = query.code.toUpperCase();
  }

  if (query.locationName) {
    filter.locationName = { $regex: query.locationName, $options: "i" };
  }

  const stops = await Stop.find(filter)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("createdBy", "fullName email role")
    .sort({ route: 1, order: 1, createdAt: -1 });

  return stops;
};

const getStopById = async (stopId) => {
  const stop = await Stop.findById(stopId)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("createdBy", "fullName email role");

  if (!stop) {
    throw new ApiError(404, "Stop not found");
  }

  return stop;
};

const updateStop = async (stopId, payload, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;
  let stop = null;

  try {
    stop = await Stop.findById(stopId);

    if (!stop) {
      throw new ApiError(404, "Stop not found");
    }

    const targetRouteId =
      payload.route !== undefined ? payload.route : stop.route.toString();

    let targetRoute = null;

    if (payload.route !== undefined) {
      targetRoute = await Route.findById(payload.route);

      if (!targetRoute) {
        throw new ApiError(404, "Route not found");
      }
    } else {
      targetRoute = await Route.findById(stop.route);
    }

    if (payload.code !== undefined && payload.code !== "") {
      const existingCode = await Stop.findOne({
        code: payload.code.toUpperCase(),
        _id: { $ne: stopId }
      });

      if (existingCode) {
        throw new ApiError(409, "Stop code already exists");
      }
    }

    const targetOrder =
      payload.order !== undefined ? payload.order : stop.order;

    const existingOrder = await Stop.findOne({
      route: targetRouteId,
      order: targetOrder,
      _id: { $ne: stopId }
    });

    if (existingOrder) {
      throw new ApiError(
        409,
        "A stop with the same order already exists in this route"
      );
    }

    const coordinates = await resolveStopCoordinates(payload, stop);

    if (payload.name !== undefined) stop.name = payload.name;
    if (payload.code !== undefined) {
      stop.code = payload.code ? payload.code.toUpperCase() : undefined;
    }
    if (payload.route !== undefined) stop.route = payload.route;
    if (payload.order !== undefined) stop.order = payload.order;
    if (payload.locationName !== undefined) stop.locationName = payload.locationName;
    if (payload.address !== undefined) stop.address = payload.address;

    stop.latitude = coordinates.latitude;
    stop.longitude = coordinates.longitude;
    stop.displayAddress = coordinates.displayAddress;
    stop.geocodingSource = coordinates.geocodingSource;
    stop.osmPlaceId = coordinates.osmPlaceId;
    stop.osmType = coordinates.osmType;
    stop.osmId = coordinates.osmId;

    if (payload.isActive !== undefined) stop.isActive = payload.isActive;

    await stop.save();

    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "update",
      entityType: "stop",
      entityId: stop._id,
      details: `Updated stop ${stop.name} successfully in route ${targetRoute?.code || ""} using ${coordinates.geocodingSource} geocoding`,
      status: "success",
      ipAddress,
      userAgent
    });

    return await Stop.findById(stop._id)
      .populate("route", "name code startLocationName endLocationName isActive")
      .populate("createdBy", "fullName email role");
  } catch (error) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "update",
      entityType: "stop",
      entityId: stop?._id || null,
      details: `Failed to update stop ${stopId}: ${error.message}`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw error;
  }
};

const deleteStop = async (stopId, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;
  let stop = null;

  try {
    stop = await Stop.findById(stopId).populate(
      "route",
      "name code startLocationName endLocationName isActive"
    );

    if (!stop) {
      throw new ApiError(404, "Stop not found");
    }

    const deletedStopId = stop._id;
    const deletedStopName = stop.name;
    const routeCode = stop.route?.code || "";

    await stop.deleteOne();

    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "delete",
      entityType: "stop",
      entityId: deletedStopId,
      details: `Deleted stop ${deletedStopName} successfully${routeCode ? ` from route ${routeCode}` : ""}`,
      status: "success",
      ipAddress,
      userAgent
    });

    return {
      id: deletedStopId,
      name: deletedStopName,
      code: stop.code
    };
  } catch (error) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "delete",
      entityType: "stop",
      entityId: stop?._id || null,
      details: `Failed to delete stop ${stopId}: ${error.message}`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw error;
  }
};

module.exports = {
  createStop,
  getAllStops,
  getStopById,
  updateStop,
  deleteStop
};