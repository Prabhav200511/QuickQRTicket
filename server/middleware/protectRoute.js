const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');

const protectRoute = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(appError('Not authenticated. Please login.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id and role
    next();
  } catch (err) {
    return next(appError('Invalid or expired token.', 401));
  }
};

module.exports = protectRoute;
