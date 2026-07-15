const { z } = require('zod');

const simulateSchema = z.object({
  body: z.object({
    targetCGPA: z.number().min(0).max(10).optional(),
    futureSemesters: z.array(
      z.object({
        semesterNo: z.number().int().positive(),
        totalCredits: z.number().positive().optional(),
        sgpa: z.number().min(0).max(10).optional(),
        expectedGrades: z.array(
          z.object({
            subjectId: z.string().optional(),
            creditHours: z.number().positive().optional(),
            letterGrade: z.string().optional(),
            gradePoints: z.number().optional(),
          })
        ).optional(),
      })
    ).optional(),
  }),
});

module.exports = {
  simulateSchema,
};
