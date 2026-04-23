const User = require("./auth.model");
const ApiError = require("../../utils/apiError");
const { generateToken } = require("../../config/jwt");
const env = require("../../config/env");
const { USER_ROLES } = require("../../utils/constants");

const registerUser = async (payload) => {
  const { fullName, email, password } = payload;

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    role: USER_ROLES.RIDER
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    token: generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    })
  };
};

const loginUser = async (payload) => {
  const { email, password } = payload;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    token: generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    })
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const ensureDefaultAdmin = async () => {
  if (!env.adminEmail || !env.adminPassword) {
    console.warn("Default admin credentials are not fully set in .env");
    return;
  }

  const existingAdmin = await User.findOne({ email: env.adminEmail.toLowerCase() });

  if (existingAdmin) {
    console.log("Default admin already exists.");
    return;
  }

  await User.create({
    fullName: env.adminFullName,
    email: env.adminEmail.toLowerCase(),
    password: env.adminPassword,
    role: USER_ROLES.ADMIN
  });

  console.log("Default admin created successfully.");
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  ensureDefaultAdmin
};