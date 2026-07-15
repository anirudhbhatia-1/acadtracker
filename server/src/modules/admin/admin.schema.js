const { z } = require('zod');

const promoteSemesterSchema = z.object({
  body: z.object({
    currentSemester: z.number().int().min(1).max(12).optional(),
  }),
});

const changeCourseSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    currentSemester: z.number().int().min(1).max(12).optional(),
  }),
});

module.exports = {
  promoteSemesterSchema,
  changeCourseSchema,
};
