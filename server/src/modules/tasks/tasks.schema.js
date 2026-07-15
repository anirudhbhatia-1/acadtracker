const { z } = require('zod');

const priorityEnum = z.enum(['HIGH', 'MEDIUM', 'LOW']);
const categoryEnum = z.enum(['ASSIGNMENT', 'EXAM', 'PROJECT', 'PERSONAL', 'OTHER']);
const statusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
    priority: priorityEnum.default('MEDIUM'),
    category: categoryEnum.default('PERSONAL'),
    subjectId: z.string().optional().nullable(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    description: z.string().optional().nullable(),
    dueDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    priority: priorityEnum.optional(),
    category: categoryEnum.optional(),
    status: statusEnum.optional(),
    subjectId: z.string().optional().nullable(),
  }),
});

const broadcastTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
    priority: priorityEnum.default('HIGH'),
    category: categoryEnum.default('ASSIGNMENT'),
    courseId: z.string().optional(),
    currentSemester: z.number().int().positive().optional(),
  }),
});

const getTasksQuerySchema = z.object({
  query: z.object({
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    category: categoryEnum.optional(),
    subjectId: z.string().optional(),
  }).optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  broadcastTaskSchema,
  getTasksQuerySchema,
};
