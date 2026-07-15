const { z } = require('zod');

const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Course name must be at least 2 characters'),
    code: z.string().min(2, 'Course code is required').toUpperCase(),
    department: z.string().min(2, 'Department is required'),
    totalSemesters: z.number().int().positive('Total semesters must be a positive integer'),
  }),
});

const updateCourseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Course name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Course code is required').toUpperCase().optional(),
    department: z.string().min(2, 'Department is required').optional(),
    totalSemesters: z.number().int().positive('Total semesters must be a positive integer').optional(),
  }),
});

const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Subject name must be at least 2 characters'),
    code: z.string().min(2, 'Subject code is required').toUpperCase(),
    semesterNo: z.number().int().positive('Semester number must be positive'),
    creditHours: z.number().int().min(0, 'Credit hours must be 0 or positive integer'),
    type: z.enum(['THEORY', 'LAB', 'ELECTIVE', 'AUDIT']).default('THEORY'),
  }),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  createSubjectSchema,
};
