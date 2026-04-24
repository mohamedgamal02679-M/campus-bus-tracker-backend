const Stop = require("./stop.model");
const Route = require("../routes/route.model");
const ApiError = require("../../utils/apiError");
const { createOperationLog } = require("../operation-logs/operationLog.service");


const resolveStopCoordinates = async (payload, existingStop = null) => {
  const hasLatitude =
    payload.latitude !== undefined &&
    payload.latitude !== null &&
    payload.latitude !== "";

  const hasLongitude =
    payload.longitude !== undefined &&
    payload.longitude !== null &&
    payload.longitude !== "";

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

  /*
    هنا مكان Nominatim بعدين
  */

  if (existingStop) {
    return {
      latitude: existingStop.latitude,
      longitude: existingStop.longitude,
      displayAddress: existingStop.displayAddress || "",
      geocodingSource: existingStop.geocodingSource || "manual",
      osmPlaceId: existingStop.osmPlaceId || "",
      osmType: existingStop.osmType || "",
      osmId: existingStop.osmId || ""
    };
  }

  throw new ApiError(
    400,
    "Latitude and longitude are required for now until Nominatim integration is added"
  );
};

const createStop = async (payload, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;

  const route = await Route.findById(payload.route);

  if (!route) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "create",
      entityType: "stop",
      entityId: null,
      details: `Failed to create stop ${payload.name || ""}: route not found`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(404, "Route not found");
  }

  if (payload.code) {
    const existingCode = await Stop.findOne({
      code: payload.code.toUpperCase()
    });

    if (existingCode) {
      await createOperationLog({
        actor: currentUser.id,
        actorRole: currentUser.role,
        action: "create",
        entityType: "stop",
        entityId: null,
        details: `Failed to create stop ${payload.name || ""}: stop code ${payload.code.toUpperCase()} already exists`,
        status: "failed",
        ipAddress,
        userAgent
      });

      throw new ApiError(409, "Stop code already exists");
    }
  }

  const existingOrder = await Stop.findOne({
    route: payload.route,
    order: payload.order
  });

  if (existingOrder) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "create",
      entityType: "stop",
      entityId: null,
      details: `Failed to create stop ${payload.name || ""}: order ${payload.order} already exists in route ${route.code}`,
      status: "failed",
      ipAddress,
      userAgent
    });

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
    details: `Created stop ${stop.name} successfully in route ${route.code}`,
    status: "success",
    ipAddress,
    userAgent
  });

  return await Stop.findById(stop._id)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("createdBy", "fullName email role");
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

  const stop = await Stop.findById(stopId);

  if (!stop) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "update",
      entityType: "stop",
      entityId: null,
      details: `Failed to update stop ${stopId}: stop not found`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(404, "Stop not found");
  }

  const targetRouteId =
    payload.route !== undefined ? payload.route : stop.route.toString();

  let targetRouteCode = "";

  if (payload.route !== undefined) {
    const route = await Route.findById(payload.route);

    if (!route) {
      await createOperationLog({
        actor: currentUser.id,
        actorRole: currentUser.role,
        action: "update",
        entityType: "stop",
        entityId: stop._id,
        details: `Failed to update stop ${stop.name}: target route not found`,
        status: "failed",
        ipAddress,
        userAgent
      });

      throw new ApiError(404, "Route not found");
    }

    targetRouteCode = route.code;
  }

  if (payload.code !== undefined && payload.code !== "") {
    const existingCode = await Stop.findOne({
      code: payload.code.toUpperCase(),
      _id: { $ne: stopId }
    });

    if (existingCode) {
      await createOperationLog({
        actor: currentUser.id,
        actorRole: currentUser.role,
        action: "update",
        entityType: "stop",
        entityId: stop._id,
        details: `Failed to update stop ${stop.name}: target code ${payload.code.toUpperCase()} already exists`,
        status: "failed",
        ipAddress,
        userAgent
      });

      throw new ApiError(409, "Stop code already exists");
    }
  }

  const targetOrder = payload.order !== undefined ? payload.order : stop.order;

  const existingOrder = await Stop.findOne({
    route: targetRouteId,
    order: targetOrder,
    _id: { $ne: stopId }
  });

  if (existingOrder) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "update",
      entityType: "stop",
      entityId: stop._id,
      details: `Failed to update stop ${stop.name}: order ${targetOrder} already exists in target route`,
      status: "failed",
      ipAddress,
      userAgent
    });

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
    details: `Updated stop ${stop.name} successfully${targetRouteCode ? ` in route ${targetRouteCode}` : ""}`,
    status: "success",
    ipAddress,
    userAgent
  });

  return await Stop.findById(stop._id)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("createdBy", "fullName email role");
};

const deleteStop = async (stopId, currentUser, requestMeta = {}) => {
  const { ipAddress = "", userAgent = "" } = requestMeta;

  const stop = await Stop.findById(stopId).populate(
    "route",
    "name code startLocationName endLocationName isActive"
  );

  if (!stop) {
    await createOperationLog({
      actor: currentUser.id,
      actorRole: currentUser.role,
      action: "delete",
      entityType: "stop",
      entityId: null,
      details: `Failed to delete stop ${stopId}: stop not found`,
      status: "failed",
      ipAddress,
      userAgent
    });

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
};

module.exports = {
  createStop,
  getAllStops,
  getStopById,
  updateStop,
  deleteStop
};