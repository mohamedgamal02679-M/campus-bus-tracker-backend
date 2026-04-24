const Stop = require("../stops/stop.model");
const Schedule = require("../schedules/schedule.model");
const ApiError = require("../../utils/apiError");

const timeToMinutes = (time) => {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const resolveDirectionFromStopOrder = (fromStop, toStop) => {
  if (fromStop.order < toStop.order) {
    return "outbound";
  }

  if (fromStop.order > toStop.order) {
    return "return";
  }

  throw new ApiError(400, "From stop and to stop cannot have the same order");
};

const planTrip = async (payload) => {
  const {
    fromStop,
    toStop,
    dayOfWeek,
    currentTime,
    direction,
    scheduleType = "regular",
    seasonLabel = "default"
  } = payload;

  const fromStopDoc = await Stop.findById(fromStop).populate(
    "route",
    "name code startLocationName endLocationName isActive"
  );

  if (!fromStopDoc) {
    throw new ApiError(404, "From stop not found");
  }

  const toStopDoc = await Stop.findById(toStop).populate(
    "route",
    "name code startLocationName endLocationName isActive"
  );

  if (!toStopDoc) {
    throw new ApiError(404, "To stop not found");
  }

  if (fromStopDoc.route._id.toString() !== toStopDoc.route._id.toString()) {
    throw new ApiError(
      400,
      "Direct trip planning currently supports stops that belong to the same route only"
    );
  }

  if (!fromStopDoc.route.isActive) {
    throw new ApiError(400, "Selected route is inactive");
  }

  let resolvedDirection = direction || resolveDirectionFromStopOrder(fromStopDoc, toStopDoc);

  if (fromStopDoc.order < toStopDoc.order && resolvedDirection !== "outbound") {
    throw new ApiError(
      400,
      "Selected direction does not match stop order. Expected outbound direction"
    );
  }

  if (fromStopDoc.order > toStopDoc.order && resolvedDirection !== "return") {
    throw new ApiError(
      400,
      "Selected direction does not match stop order. Expected return direction"
    );
  }

  const baseFilter = {
    route: fromStopDoc.route._id,
    dayOfWeek,
    direction: resolvedDirection,
    scheduleType,
    seasonLabel,
    isActive: true
  };

  const fromSchedules = await Schedule.find({
    ...baseFilter,
    stop: fromStopDoc._id
  }).sort({ departureTime: 1 });

  const toSchedules = await Schedule.find({
    ...baseFilter,
    stop: toStopDoc._id
  }).sort({ departureTime: 1 });

  if (!fromSchedules.length || !toSchedules.length) {
    return {
      route: fromStopDoc.route,
      fromStop: fromStopDoc,
      toStop: toStopDoc,
      dayOfWeek,
      direction: resolvedDirection,
      scheduleType,
      seasonLabel,
      totalTrips: 0,
      trips: []
    };
  }

  const currentTimeInMinutes = currentTime ? timeToMinutes(currentTime) : null;

  const preparedToSchedules = toSchedules.map((schedule) => ({
    schedule,
    comparableTime: timeToMinutes(schedule.arrivalTime || schedule.departureTime)
  }));

  const trips = [];

  for (const fromSchedule of fromSchedules) {
    const departureMinutes = timeToMinutes(fromSchedule.departureTime);

    if (
      currentTimeInMinutes !== null &&
      departureMinutes !== null &&
      departureMinutes < currentTimeInMinutes
    ) {
      continue;
    }

    const matchedToSchedule = preparedToSchedules.find(
      (item) =>
        item.comparableTime !== null &&
        departureMinutes !== null &&
        item.comparableTime > departureMinutes
    );

    if (!matchedToSchedule) {
      continue;
    }

    const arrivalSchedule = matchedToSchedule.schedule;
    const arrivalTime = arrivalSchedule.arrivalTime || arrivalSchedule.departureTime;
    const arrivalMinutes = matchedToSchedule.comparableTime;

    trips.push({
      route: {
        id: fromStopDoc.route._id,
        name: fromStopDoc.route.name,
        code: fromStopDoc.route.code
      },
      fromStop: {
        id: fromStopDoc._id,
        name: fromStopDoc.name,
        order: fromStopDoc.order
      },
      toStop: {
        id: toStopDoc._id,
        name: toStopDoc.name,
        order: toStopDoc.order
      },
      dayOfWeek,
      direction: resolvedDirection,
      scheduleType,
      seasonLabel,
      departureTime: fromSchedule.departureTime,
      arrivalTime,
      estimatedTravelMinutes:
        arrivalMinutes !== null && departureMinutes !== null
          ? arrivalMinutes - departureMinutes
          : null,
      fromScheduleId: fromSchedule._id,
      toScheduleId: arrivalSchedule._id
    });
  }

  return {
    route: fromStopDoc.route,
    fromStop: fromStopDoc,
    toStop: toStopDoc,
    dayOfWeek,
    direction: resolvedDirection,
    scheduleType,
    seasonLabel,
    totalTrips: trips.length,
    trips
  };
};

module.exports = {
  planTrip
};