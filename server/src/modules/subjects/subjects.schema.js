const { z } = require('zod');

const updateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Subject name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Subject code is required').toUpperCase().optional(),
    semesterNo: z.number().int().positive('Semester number must be positive').optional(),
    creditHours: z.number().int().min(0, 'Credit hours must be 0 or positive integer').optional(),
    type: z.enum(['THEORY', 'LAB', 'ELECTIVE', 'AUDIT']).optional(),
    isArchived: z.boolean().optional(),
  }),
});

module.exports = {
  updateSubjectSchema,
};
