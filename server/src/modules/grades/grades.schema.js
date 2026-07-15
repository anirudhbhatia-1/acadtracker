const { z } = require('zod');

const letterGradeEnum = z.enum(['O', 'A_PLUS', 'A', 'B_PLUS', 'B', 'C', 'D', 'F']);

const upsertGradeSchema = z.object({
  body: z.object({
    subjectId: z.string().min(1, 'Subject ID is required'),
    semesterNo: z.number().int().positive('Semester number must be positive'),
    letterGrade: letterGradeEnum,
  }),
});

const adminUpdateGradeSchema = z.object({
  body: z.object({
    letterGrade: letterGradeEnum.optional(),
    gradePoints: z.number().min(0).max(10).optional(),
  }),
});

module.exports = {
  upsertGradeSchema,
  adminUpdateGradeSchema,
};
