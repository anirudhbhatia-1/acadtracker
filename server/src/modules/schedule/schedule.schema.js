const { z } = require('zod');

const getScheduleSchema = z.object({
  query: z.object({
    semesterNo: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
  }),
});

const saveScheduleSchema = z.object({
  body: z.object({
    subjectId: z.string().min(1, 'Subject ID is required'),
    semesterNo: z.number().int().positive('Semester number must be positive'),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .default([]),
  }),
});

module.exports = {
  getScheduleSchema,
  saveScheduleSchema,
};
