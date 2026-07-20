const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { getScheduleSchema, saveScheduleSchema } = require('./schedule.schema');
const { getMySchedule, saveMySchedule } = require('./schedule.controller');

router.get('/me', authenticate, validate(getScheduleSchema), getMySchedule);
router.post('/me', authenticate, validate(saveScheduleSchema), saveMySchedule);
router.put('/me', authenticate, validate(saveScheduleSchema), saveMySchedule);

module.exports = router;
