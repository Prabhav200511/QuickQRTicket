const appError = require('../utils/appError');

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(appError('You are not authorized to access this route.', 403));
    }
    next();
  };
};

module.exports = authorizeRole;
