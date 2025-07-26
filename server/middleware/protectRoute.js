// middleware/protectRoute.js

const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');

const protectRoute = (req, res, next) => {
  // Assuming cookie-parser middleware is installed and used in your app
  const token =
    req.cookies.token ||
    (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return next(appError('Not authenticated. Please login.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return next(appError('Invalid or expired token.', 401));
  }
};

module.exports = protectRoute;
