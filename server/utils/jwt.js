// utils/jwt.js

const jwt = require('jsonwebtoken');

// Ensure the JWT_SECRET environment variable is defined before starting the app
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

/**
 * Create a JWT token with given payload, expires in 2 days.
 * @param {Object} payload - The data to encode in the JWT (e.g., user id and role)
 * @returns {string} Signed JWT token
 */
function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' });
}

/**
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { createToken, verifyToken };
