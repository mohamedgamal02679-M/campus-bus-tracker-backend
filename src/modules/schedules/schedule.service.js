const Schedule = require("./schedule.model");
const Route = require("../routes/route.model");
const Stop = require("../stops/stop.model");
const ApiError = require("../../utils/apiError");

const ensureRouteAndStopAreValid = async (routeId, stopId) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  const stop = await Stop.findById(stopId);

  if (!stop) {
    throw new ApiError(404, "Stop not found");
  }

  if (stop.route.toString() !== routeId.toString()) {
    throw new ApiError(400, "Selected stop does not belong to the selected route");
  }

  return { route, stop };
};

const ensureScheduleIsUnique = async ({
  route,
  stop,
  dayOfWeek,
  departureTime,
  direction,
  seasonLabel,
  excludeId = null
}) => {
  const filter = {
    route,
    stop,
    dayOfWeek,
    departureTime,
    direction,
    seasonLabel
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const existingSchedule = await Schedule.findOne(filter);

  if (existingSchedule) {
    throw new ApiError(
      409,
      "A schedule with the same route, stop, day, departure time, direction, and season already exists"
    );
  }
};

const createSchedule = async (payload, currentUser) => {
  const direction = payload.direction || "outbound";
  const scheduleType = payload.scheduleType || "regular";
  const seasonLabel = payload.seasonLabel || "default";

  await ensureRouteAndStopAreValid(payload.route, payload.stop);

  await ensureScheduleIsUnique({
    route: payload.route,
    stop: payload.stop,
    dayOfWeek: payload.dayOfWeek,
    departureTime: payload.departureTime,
    direction,
    seasonLabel
  });

  const schedule = await Schedule.create({
    route: payload.route,
    stop: payload.stop,
    dayOfWeek: payload.dayOfWeek,
    departureTime: payload.departureTime,
    arrivalTime: payload.arrivalTime || "",
    direction,
    scheduleType,
    seasonLabel,
    effectiveFrom: payload.effectiveFrom || null,
    effectiveTo: payload.effectiveTo || null,
    notes: payload.notes || "",
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    createdBy: currentUser.id
  });

  return await Schedule.findById(schedule._id)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("stop", "name code order locationName address latitude longitude isActive")
    .populate("createdBy", "fullName email role");
};

const getAllSchedules = async (query = {}) => {
  const filter = {};

  if (query.route) {
    filter.route = query.route;
  }

  if (query.stop) {
    filter.stop = query.stop;
  }

  if (query.dayOfWeek) {
    filter.dayOfWeek = query.dayOfWeek;
  }

  if (query.direction) {
    filter.direction = query.direction;
  }

  if (query.scheduleType) {
    filter.scheduleType = query.scheduleType;
  }

  if (query.seasonLabel) {
    filter.seasonLabel = query.seasonLabel;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  const schedules = await Schedule.find(filter)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("stop", "name code order locationName address latitude longitude isActive")
    .populate("createdBy", "fullName email role")
    .sort({ dayOfWeek: 1, departureTime: 1, createdAt: -1 });

  return schedules;
};

const getScheduleById = async (scheduleId) => {
  const schedule = await Schedule.findById(scheduleId)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("stop", "name code order locationName address latitude longitude isActive")
    .populate("createdBy", "fullName email role");

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  return schedule;
};

const updateSchedule = async (scheduleId, payload) => {
  const schedule = await Schedule.findById(scheduleId);

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  const targetRoute = payload.route !== undefined ? payload.route : schedule.route;
  const targetStop = payload.stop !== undefined ? payload.stop : schedule.stop;
  const targetDayOfWeek =
    payload.dayOfWeek !== undefined ? payload.dayOfWeek : schedule.dayOfWeek;
  const targetDepartureTime =
    payload.departureTime !== undefined ? payload.departureTime : schedule.departureTime;
  const targetDirection =
    payload.direction !== undefined ? payload.direction : schedule.direction;
  const targetSeasonLabel =
    payload.seasonLabel !== undefined
      ? payload.seasonLabel || "default"
      : schedule.seasonLabel;

  await ensureRouteAndStopAreValid(targetRoute, targetStop);

  await ensureScheduleIsUnique({
    route: targetRoute,
    stop: targetStop,
    dayOfWeek: targetDayOfWeek,
    departureTime: targetDepartureTime,
    direction: targetDirection,
    seasonLabel: targetSeasonLabel,
    excludeId: scheduleId
  });

  if (payload.route !== undefined) schedule.route = payload.route;
  if (payload.stop !== undefined) schedule.stop = payload.stop;
  if (payload.dayOfWeek !== undefined) schedule.dayOfWeek = payload.dayOfWeek;
  if (payload.departureTime !== undefined) schedule.departureTime = payload.departureTime;
  if (payload.arrivalTime !== undefined) schedule.arrivalTime = payload.arrivalTime;
  if (payload.direction !== undefined) schedule.direction = payload.direction;
  if (payload.scheduleType !== undefined) schedule.scheduleType = payload.scheduleType;
  if (payload.seasonLabel !== undefined) {
    schedule.seasonLabel = payload.seasonLabel || "default";
  }
  if (payload.effectiveFrom !== undefined) schedule.effectiveFrom = payload.effectiveFrom || null;
  if (payload.effectiveTo !== undefined) schedule.effectiveTo = payload.effectiveTo || null;
  if (payload.notes !== undefined) schedule.notes = payload.notes;
  if (payload.isActive !== undefined) schedule.isActive = payload.isActive;

  await schedule.save();

  return await Schedule.findById(schedule._id)
    .populate("route", "name code startLocationName endLocationName isActive")
    .populate("stop", "name code order locationName address latitude longitude isActive")
    .populate("createdBy", "fullName email role");
};

const deleteSchedule = async (scheduleId) => {
  const schedule = await Schedule.findById(scheduleId);

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  await schedule.deleteOne();

  return {
    id: schedule._id,
    dayOfWeek: schedule.dayOfWeek,
    departureTime: schedule.departureTime
  };
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
};