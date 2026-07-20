const { z } = require('zod');

const EVENT_TYPES = ['EXAM', 'DEADLINE', 'HOLIDAY', 'OTHER'];

const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Event title is required'),
    description: z.string().trim().nullable().optional(),
    date: z.string().or(z.date()),
    type: z.enum(EVENT_TYPES, {
      errorMap: () => ({ message: `Event type must be one of: ${EVENT_TYPES.join(', ')}` }),
    }),
    courseId: z.string().trim().nullable().optional(),
    semesterNo: z.number().int().min(1).max(12).nullable().optional(),
  }),
});

const updateEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().nullable().optional(),
    date: z.string().or(z.date()).optional(),
    type: z.enum(EVENT_TYPES).optional(),
    courseId: z.string().trim().nullable().optional(),
    semesterNo: z.number().int().min(1).max(12).nullable().optional(),
  }),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  EVENT_TYPES,
};
