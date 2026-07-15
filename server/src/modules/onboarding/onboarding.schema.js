const { z } = require('zod');

const selectCourseSchema = z.object({
  body: z.object({
    courseId: z.string({ required_error: 'Course selection is required' }).min(1, 'Course ID cannot be empty'),
    currentSemester: z
      .number({ required_error: 'Current semester is required' })
      .int('Semester must be an integer')
      .min(1, 'Current semester must be at least 1'),
  }),
});

module.exports = {
  selectCourseSchema,
};
