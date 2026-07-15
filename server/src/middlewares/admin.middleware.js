const responseHelper = require('../utils/responseHelper');

/**
 * Admin authorization middleware.
 * Must be used AFTER `authenticate` middleware.
 * Verifies that the authenticated user has the 'ADMIN' role.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return responseHelper.error(res, 'Access denied. Administrator permissions required.', 403);
  }
  return next();
};

module.exports = requireAdmin;
