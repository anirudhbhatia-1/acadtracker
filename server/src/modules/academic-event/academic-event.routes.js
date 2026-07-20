const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createEventSchema, updateEventSchema } = require('./academic-event.schema');
const {
  getStudentEventsController,
  getAdminEventsController,
  createEventController,
  updateEventController,
  deleteEventController,
} = require('./academic-event.controller');

const studentRouter = express.Router();
studentRouter.get('/', authenticate, getStudentEventsController);

const adminRouter = express.Router();
adminRouter.get('/', authenticate, isAdmin, getAdminEventsController);
adminRouter.post('/', authenticate, isAdmin, validate(createEventSchema), createEventController);
adminRouter.patch('/:id', authenticate, isAdmin, validate(updateEventSchema), updateEventController);
adminRouter.delete('/:id', authenticate, isAdmin, deleteEventController);

module.exports = {
  studentRouter,
  adminRouter,
};
