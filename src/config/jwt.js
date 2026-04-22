const jwt = require("jsonwebtoken");
const env = require("./env");

const generateToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
};

module.exports = {
  generateToken
};
