const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const { logAttendanceSchema, updateAttendanceSchema } = require('./attendance.schema');
const {
  getMyAttendance,
  logAttendance,
  updateMyAttendance,
  getStudentAttendance,
  updateStudentAttendanceBySubject,
} = require('./attendance.controller');

// Student endpoints
router.get('/me', authenticate, getMyAttendance);
router.post('/log', authenticate, validate(logAttendanceSchema), logAttendance);
router.patch('/:id', authenticate, validate(updateAttendanceSchema), updateMyAttendance);

// Admin endpoints
router.get('/student/:id', authenticate, isAdmin, getStudentAttendance);
router.patch('/student/:id/:subjectId', authenticate, isAdmin, validate(updateAttendanceSchema), updateStudentAttendanceBySubject);

module.exports = router;
