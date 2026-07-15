const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
  createTaskSchema,
  updateTaskSchema,
  broadcastTaskSchema,
  getTasksQuerySchema,
} = require('./tasks.schema');
const {
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
  broadcastTask,
} = require('./tasks.controller');

// Broadcast route must be placed before /:id parameter routes
router.post('/broadcast', authenticate, isAdmin, validate(broadcastTaskSchema), broadcastTask);

// Current user task endpoints
router.get('/me', authenticate, validate(getTasksQuerySchema), getMyTasks);
router.post('/', authenticate, validate(createTaskSchema), createTask);
router.patch('/:id', authenticate, validate(updateTaskSchema), updateTask);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;
