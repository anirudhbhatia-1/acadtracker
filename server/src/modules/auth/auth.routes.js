const express = require('express');
const router = express.Router();
const validate = require('../../middlewares/validate.middleware');
const authenticate = require('../../middlewares/auth.middleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('./auth.schema');
const { register, login, logout, getMe, updateProfile } = require('./auth.controller');

// Public endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Authenticated endpoints
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), updateProfile);

module.exports = router;
