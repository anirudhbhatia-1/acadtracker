const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const { upsertGradeSchema, adminUpdateGradeSchema } = require('./grades.schema');
const {
  getMyGrades,
  upsertMyGrade,
  getMySGPA,
  getMyCGPA,
  getStudentGrades,
  updateGrade,
} = require('./grades.controller');

// Student endpoints
router.get('/me', authenticate, getMyGrades);
router.post('/', authenticate, validate(upsertGradeSchema), upsertMyGrade);
router.get('/me/sgpa', authenticate, getMySGPA);
router.get('/me/cgpa', authenticate, getMyCGPA);

// Admin endpoints
router.get('/student/:id', authenticate, isAdmin, getStudentGrades);
router.patch('/:id', authenticate, isAdmin, validate(adminUpdateGradeSchema), updateGrade);

module.exports = router;
