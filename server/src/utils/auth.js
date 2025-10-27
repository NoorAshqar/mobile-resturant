const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Missing JWT_SECRET environment variable for the API server."
    );
  }
  return secret;
}

function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1h" });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
};
