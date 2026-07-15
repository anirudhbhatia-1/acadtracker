const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');

/**
 * Helper function to sign JWT token and set HTTP-only cookie
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };

  res.cookie('token', token, cookieOptions);

  // Return user object without sensitive fields
  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePic: user.profilePic,
    courseId: user.courseId,
    currentSemester: user.currentSemester,
    isOnboarded: user.isOnboarded,
    createdAt: user.createdAt,
    course: user.course || null,
  };

  return responseHelper.success(res, { user: userResponse, token }, message, statusCode);
};

/**
 * Register new student
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    return responseHelper.error(res, 'Email is already registered. Please log in instead.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'STUDENT',
      isOnboarded: false,
    },
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

  return responseHelper.success(res, { user: newUser }, 'Registration successful. Please log in.', 201);
};

/**
 * Login student or admin
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { course: true },
  });

  if (!user) {
    return responseHelper.error(res, 'Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return responseHelper.error(res, 'Invalid email or password', 401);
  }

  return sendTokenResponse(user, 200, res, 'Login successful');
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return responseHelper.success(res, null, 'Logged out successfully', 200);
};

/**
 * Get current logged-in user profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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
      course: true,
    },
  });

  if (!user) {
    return responseHelper.error(res, 'User not found', 404);
  }

  return responseHelper.success(res, { user }, 'User profile retrieved successfully', 200);
};

/**
 * Update profile (name, password)
 * PATCH /api/v1/auth/me
 */
const updateProfile = async (req, res) => {
  const { name, password } = req.body;
  const updateData = {};

  if (name !== undefined) {
    updateData.name = name.trim();
  }

  if (password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
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
      course: true,
    },
  });

  return responseHelper.success(res, { user: updatedUser }, 'Profile updated successfully', 200);
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
};
