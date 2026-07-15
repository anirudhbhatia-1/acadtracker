const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const { promoteSemesterSchema, changeCourseSchema } = require('./admin.schema');
const {
  getStudents,
  getStudentProfile,
  promoteStudentSemester,
  changeStudentCourse,
  getAnalytics,
  getAtRiskStudents,
} = require('./admin.controller');

// All admin endpoints require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/students', getStudents);
router.get('/students/:id', getStudentProfile);
router.patch('/students/:id/semester', validate(promoteSemesterSchema), promoteStudentSemester);
router.patch('/students/:id/course', validate(changeCourseSchema), changeStudentCourse);
router.get('/analytics', getAnalytics);
router.get('/at-risk', getAtRiskStudents);

module.exports = router;
