const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const { getAllCourses } = require('./courses.controller');

// All course listing requests require authentication
router.get('/', authenticate, getAllCourses);

module.exports = router;
