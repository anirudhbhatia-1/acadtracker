const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
  createCourseSchema,
  updateCourseSchema,
  createSubjectSchema,
} = require('./courses.schema');
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getSubjectsByCourse,
  createSubject,
} = require('./courses.controller');

// Public to all authenticated users
router.get('/', authenticate, getAllCourses);
router.get('/:id/subjects', authenticate, getSubjectsByCourse);

// Admin-only endpoints
router.post('/', authenticate, isAdmin, validate(createCourseSchema), createCourse);
router.patch('/:id', authenticate, isAdmin, validate(updateCourseSchema), updateCourse);
router.delete('/:id', authenticate, isAdmin, deleteCourse);
router.post('/:id/subjects', authenticate, isAdmin, validate(createSubjectSchema), createSubject);

module.exports = router;
