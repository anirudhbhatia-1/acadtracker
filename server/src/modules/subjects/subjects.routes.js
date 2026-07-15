const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const { updateSubjectSchema } = require('./subjects.schema');
const { updateSubject, archiveSubject } = require('./subjects.controller');

// Admin-only endpoints
router.patch('/:id', authenticate, isAdmin, validate(updateSubjectSchema), updateSubject);
router.delete('/:id', authenticate, isAdmin, archiveSubject);

module.exports = router;
