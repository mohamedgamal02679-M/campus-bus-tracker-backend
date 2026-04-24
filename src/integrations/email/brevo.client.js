const axios = require("axios");

const BREVO_BASE_URL =
  process.env.BREVO_BASE_URL || "https://api.brevo.com/v3";

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";

const brevoClient = axios.create({
  baseURL: BREVO_BASE_URL,
  timeout: 15000,
  headers: {
    "api-key": BREVO_API_KEY,
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

const sendTransactionalEmailRequest = async (payload) => {
  if (!BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set in environment variables");
  }

  const response = await brevoClient.post("/smtp/email", payload);
  return response.data;
};

module.exports = {
  brevoClient,
  sendTransactionalEmailRequest
};