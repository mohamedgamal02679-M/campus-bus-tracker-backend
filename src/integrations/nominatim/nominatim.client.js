const axios = require("axios");

const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT || "CampusBusTracker/1.0 (contact: your-email@example.com)";

const NOMINATIM_EMAIL = process.env.NOMINATIM_EMAIL || "";

let lastRequestTime = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enforceRateLimit = async () => {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < 1000) {
    await sleep(1000 - elapsed);
  }

  lastRequestTime = Date.now();
};

const nominatimClient = axios.create({
  baseURL: NOMINATIM_BASE_URL,
  timeout: 15000,
  headers: {
    "User-Agent": NOMINATIM_USER_AGENT,
    Accept: "application/json"
  }
});

const searchLocation = async ({ query, countryCodes = "eg", limit = 1 }) => {
  if (!query || typeof query !== "string" || !query.trim()) {
    throw new Error("Nominatim search query is required");
  }

  await enforceRateLimit();

  const params = {
    q: query.trim(),
    format: "jsonv2",
    addressdetails: 1,
    limit
  };

  if (countryCodes) {
    params.countrycodes = countryCodes;
  }

  if (NOMINATIM_EMAIL) {
    params.email = NOMINATIM_EMAIL;
  }

  const response = await nominatimClient.get("/search", { params });

  return response.data;
};

module.exports = {
  searchLocation
};