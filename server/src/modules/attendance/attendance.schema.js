const { z } = require('zod');

const logAttendanceSchema = z.object({
  body: z.object({
    subjectId: z.string().min(1, 'Subject ID is required'),
    semesterNo: z.number().int().positive('Semester number must be positive'),
    action: z.enum(['ATTENDED', 'MISSED']).default('ATTENDED'),
    totalIncrement: z.number().int().positive().default(1),
    attendedIncrement: z.number().int().min(0).default(1),
  }),
});

const updateAttendanceSchema = z.object({
  body: z.object({
    totalClasses: z.number().int().min(0).optional(),
    attendedClasses: z.number().int().min(0).optional(),
  }).refine(data => {
    if (data.totalClasses !== undefined && data.attendedClasses !== undefined) {
      return data.attendedClasses <= data.totalClasses;
    }
    return true;
  }, { message: 'Attended classes cannot exceed total classes' }),
});

module.exports = {
  logAttendanceSchema,
  updateAttendanceSchema,
};
