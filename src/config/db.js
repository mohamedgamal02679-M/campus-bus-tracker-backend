const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  if (!env.mongoUri || env.mongoUri.includes("your_mongodb_connection_string_here")) {
    console.warn("MONGO_URI is not set yet. Skipping database connection for now.");
    return;
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected successfully.");
};

module.exports = connectDB;
