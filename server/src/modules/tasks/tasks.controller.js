const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');

/**
 * Get current user's tasks with optional filters (status, category, priority, subjectId)
 * GET /api/v1/tasks/me
 */
const getMyTasks = async (req, res) => {
  const userId = req.user.id;
  const { status, category, priority, subjectId } = req.query || {};

  const where = { userId };
  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;
  if (subjectId) where.subjectId = subjectId;

  const tasks = await prisma.task.findMany({
    where,
    include: { subject: true },
    orderBy: { dueDate: 'asc' }, // Sorted by due date (soonest first per rules & phases.md)
  });

  const now = new Date();
  const enrichedTasks = tasks.map((task) => {
    const isOverdue = new Date(task.dueDate) < now && task.status !== 'DONE';
    return {
      ...task,
      isOverdue,
    };
  });

  return responseHelper.success(
    res,
    { tasks: enrichedTasks },
    'Tasks retrieved successfully',
    200
  );
};

/**
 * Create a new task for current user
 * POST /api/v1/tasks
 */
const createTask = async (req, res) => {
  const userId = req.user.id;
  const { title, description, dueDate, priority, category, subjectId } = req.body;

  if (subjectId) {
    const sub = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!sub) {
      return responseHelper.error(res, 'Subject not found', 404, 'SUBJECT_NOT_FOUND');
    }
  }

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      description,
      dueDate,
      priority: priority || 'MEDIUM',
      category: category || 'PERSONAL',
      subjectId: subjectId || null,
    },
    include: { subject: true },
  });

  const now = new Date();
  const isOverdue = new Date(task.dueDate) < now && task.status !== 'DONE';

  return responseHelper.success(
    res,
    { task: { ...task, isOverdue } },
    'Task created successfully',
    201
  );
};

/**
 * Update task (only own task or admin)
 * PATCH /api/v1/tasks/:id
 */
const updateTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return responseHelper.error(res, 'Task not found', 404, 'TASK_NOT_FOUND');
  }

  if (existing.userId !== userId && !isAdmin) {
    return responseHelper.error(res, 'Unauthorized to update this task', 403, 'FORBIDDEN');
  }

  const { title, description, dueDate, priority, category, status, subjectId } = req.body;

  if (subjectId !== undefined && subjectId !== null) {
    const sub = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!sub) {
      return responseHelper.error(res, 'Subject not found', 404, 'SUBJECT_NOT_FOUND');
    }
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate }),
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category }),
      ...(status !== undefined && { status }),
      ...(subjectId !== undefined && { subjectId }),
    },
    include: { subject: true },
  });

  const now = new Date();
  const isOverdue = new Date(updated.dueDate) < now && updated.status !== 'DONE';

  return responseHelper.success(
    res,
    { task: { ...updated, isOverdue } },
    'Task updated successfully',
    200
  );
};

/**
 * Delete task (only own task or admin)
 * DELETE /api/v1/tasks/:id
 */
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return responseHelper.error(res, 'Task not found', 404, 'TASK_NOT_FOUND');
  }

  if (existing.userId !== userId && !isAdmin) {
    return responseHelper.error(res, 'Unauthorized to delete this task', 403, 'FORBIDDEN');
  }

  await prisma.task.delete({ where: { id } });

  return responseHelper.success(
    res,
    { id },
    'Task deleted successfully',
    200
  );
};

/**
 * Admin broadcast task/notice to all students (optionally filtered by course/semester)
 * POST /api/v1/tasks/broadcast
 */
const broadcastTask = async (req, res) => {
  const { title, description, dueDate, priority, category, courseId, currentSemester } = req.body;

  const where = { role: 'STUDENT' };
  if (courseId) where.courseId = courseId;
  if (currentSemester) where.currentSemester = currentSemester;

  const students = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  if (students.length === 0) {
    return responseHelper.success(
      res,
      { broadcastCount: 0 },
      'No matching students found to broadcast task',
      200
    );
  }

  const taskData = students.map((st) => ({
    userId: st.id,
    title,
    description: description || null,
    dueDate,
    priority: priority || 'HIGH',
    category: category || 'ASSIGNMENT',
    status: 'TODO',
  }));

  const result = await prisma.task.createMany({
    data: taskData,
  });

  return responseHelper.success(
    res,
    { broadcastCount: result.count },
    `Broadcast task successfully created for ${result.count} students`,
    201
  );
};

module.exports = {
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
  broadcastTask,
};
