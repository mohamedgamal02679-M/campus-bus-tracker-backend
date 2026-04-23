require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "change_this_to_a_strong_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  azureMapsKey: process.env.AZURE_MAPS_KEY || "",
  sendGridApiKey: process.env.SENDGRID_API_KEY || "",
  sendGridFromEmail: process.env.SENDGRID_FROM_EMAIL || "",
  adminFullName: process.env.ADMIN_FULL_NAME || "Main Admin",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || ""
};