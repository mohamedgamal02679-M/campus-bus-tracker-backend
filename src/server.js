const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const { ensureDefaultAdmin } = require("./modules/auth/auth.service");

const startServer = async () => {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    app.listen(env.port, () => {
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();