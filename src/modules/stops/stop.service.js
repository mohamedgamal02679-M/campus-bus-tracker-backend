const Stop = require("./stop.model");
const Route = require("../routes/route.model");
const ApiError = require("../../utils/apiError");


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
    هنا مكان Nominatim بعدين، مثال:
    const geocoded = await geocodeWithNominatim({
      locationName: payload.locationName,
      address: payload.address
    });

    return {
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      displayAddress: geocoded.displayAddress,
      geocodingSource: "nominatim",
      osmPlaceId: geocoded.osmPlaceId,
      osmType: geocoded.osmType,
      osmId: geocoded.osmId
    };
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

const createStop = async (payload, currentUser) => {
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

const updateStop = async (stopId, payload) => {
  const stop = await Stop.findById(stopId);

  if (!stop) {
    throw new ApiError(404, "Stop not found");
  }

  const targetRouteId =
    payload.route !== undefined ? payload.route : stop.route.toString();

  if (payload.route !== undefined) {
    const route = await Route.findById(payload.route);

    if (!route) {
      throw new ApiError(404, "Route not found");
    }
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

  const targetOrder = payload.order !== undefined ? payload.order : stop.order;

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

  return await Stop.findById(stop._id)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("createdBy", "fullName email role");
};

const deleteStop = async (stopId) => {
  const stop = await Stop.findById(stopId);

  if (!stop) {
    throw new ApiError(404, "Stop not found");
  }

  await stop.deleteOne();

  return {
    id: stop._id,
    name: stop.name,
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