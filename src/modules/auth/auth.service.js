const User = require("./auth.model");
const ApiError = require("../../utils/apiError");
const { generateToken } = require("../../config/jwt");
const env = require("../../config/env");
const { USER_ROLES } = require("../../utils/constants");
const { createOperationLog } = require("../operation-logs/operationLog.service");

const registerUser = async (payload, requestMeta = {}) => {
  const { fullName, email, password } = payload;
  const normalizedEmail = email.toLowerCase();

  const { ipAddress = "", userAgent = "" } = requestMeta;

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    await createOperationLog({
      actor: null,
      actorRole: "",
      action: "register",
      entityType: "auth",
      entityId: null,
      details: `Failed registration attempt for email ${normalizedEmail}: email already registered`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password,
    role: USER_ROLES.RIDER
  });

  await createOperationLog({
    actor: user._id,
    actorRole: user.role,
    action: "register",
    entityType: "auth",
    entityId: user._id,
    details: `User registered successfully with email ${user.email}`,
    status: "success",
    ipAddress,
    userAgent
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

const loginUser = async (payload, requestMeta = {}) => {
  const { email, password } = payload;
  const normalizedEmail = email.toLowerCase();

  const { ipAddress = "", userAgent = "" } = requestMeta;

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    await createOperationLog({
      actor: null,
      actorRole: "",
      action: "login",
      entityType: "auth",
      entityId: null,
      details: `Failed login attempt for email ${normalizedEmail}: user not found`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    await createOperationLog({
      actor: user._id,
      actorRole: user.role,
      action: "login",
      entityType: "auth",
      entityId: user._id,
      details: `Failed login attempt for email ${user.email}: invalid password`,
      status: "failed",
      ipAddress,
      userAgent
    });

    throw new ApiError(401, "Invalid email or password");
  }

  await createOperationLog({
    actor: user._id,
    actorRole: user.role,
    action: "login",
    entityType: "auth",
    entityId: user._id,
    details: `User logged in successfully with email ${user.email}`,
    status: "success",
    ipAddress,
    userAgent
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

  const admin = await User.create({
    fullName: env.adminFullName,
    email: env.adminEmail.toLowerCase(),
    password: env.adminPassword,
    role: USER_ROLES.ADMIN
  });

  await createOperationLog({
    actor: admin._id,
    actorRole: admin.role,
    action: "system_action",
    entityType: "system",
    entityId: admin._id,
    details: "Default admin created automatically during server startup",
    status: "success",
    ipAddress: "",
    userAgent: "system"
  });

  console.log("Default admin created successfully.");
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  ensureDefaultAdmin
};