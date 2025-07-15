const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { createToken, verifyToken };
