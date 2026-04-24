const { searchLocation } = require("./nominatim.client");
const ApiError = require("../../utils/apiError");

const buildSearchQueries = ({ locationName, address }) => {
  const queries = [];

  const safeLocationName = (locationName || "").trim();
  const safeAddress = (address || "").trim();

  if (safeLocationName && safeAddress) {
    queries.push(`${safeLocationName}, ${safeAddress}, Egypt`);
    queries.push(`${safeLocationName}, ${safeAddress}`);
  }

  if (safeAddress) {
    queries.push(`${safeAddress}, Egypt`);
    queries.push(safeAddress);
  }

  if (safeLocationName) {
    queries.push(`${safeLocationName}, Egypt`);
    queries.push(safeLocationName);
  }

  return [...new Set(queries.filter(Boolean))];
};

const normalizeNominatimResult = (result) => {
  if (!result) {
    throw new ApiError(404, "No geocoding result found");
  }

  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new ApiError(400, "Invalid coordinates returned from Nominatim");
  }

  return {
    latitude,
    longitude,
    displayAddress: result.display_name || "",
    geocodingSource: "nominatim",
    osmPlaceId: result.place_id ? String(result.place_id) : "",
    osmType: result.osm_type || "",
    osmId: result.osm_id ? String(result.osm_id) : ""
  };
};

const geocodeStopLocation = async ({ locationName, address }) => {
  const queries = buildSearchQueries({ locationName, address });

  if (!queries.length) {
    throw new ApiError(400, "Location name or address is required for geocoding");
  }

  for (const query of queries) {
    const results = await searchLocation({
      query,
      countryCodes: "eg",
      limit: 1
    });

    if (Array.isArray(results) && results.length > 0) {
      return normalizeNominatimResult(results[0]);
    }
  }

  throw new ApiError(404, "Could not geocode the provided stop location");
};

module.exports = {
  geocodeStopLocation
};