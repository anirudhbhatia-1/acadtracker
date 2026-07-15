const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const responseHelper = require('../utils/responseHelper');

/**
 * Authentication middleware.
 * Verifies JWT from HTTP-only cookie (`token`), loads user from database, and attaches to `req.user`.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.cookies?.jwt;

    // Optional fallback: Check Authorization bearer header if cookie missing (helpful for Postman/CLI tests)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return responseHelper.error(res, 'Authentication required. Please log in.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return responseHelper.error(res, 'Invalid token payload', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePic: true,
        courseId: true,
        currentSemester: true,
        isOnboarded: true,
        createdAt: true,
      },
    });

    if (!user) {
      return responseHelper.error(res, 'User associated with this token no longer exists', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return responseHelper.error(res, 'Session expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return responseHelper.error(res, 'Invalid authentication token', 401);
    }
    return next(error);
  }
};

module.exports = authenticate;
