const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { selectCourseSchema } = require('./onboarding.schema');
const { selectCourse } = require('./onboarding.controller');

// All onboarding endpoints require authentication
router.post('/select-course', authenticate, validate(selectCourseSchema), selectCourse);

module.exports = router;
