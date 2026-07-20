const prisma = require('../../config/db');

/**
 * Get all class schedules for a student, optionally filtered by semesterNo
 */
const getStudentSchedule = async (studentId, semesterNo) => {
  const whereClause = { studentId };
  if (semesterNo !== undefined && semesterNo !== null) {
    whereClause.semesterNo = Number(semesterNo);
  }

  const schedules = await prisma.classSchedule.findMany({
    where: whereClause,
    orderBy: [{ semesterNo: 'asc' }, { dayOfWeek: 'asc' }],
  });

  return schedules;
};

/**
 * Save / replace scheduled days of week for a specific student + subject + semesterNo combination
 */
const saveSubjectSchedule = async (studentId, subjectId, semesterNo, daysOfWeek) => {
  // Ensure subject exists and verify semesterNo match per rules.md §9
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    const error = new Error('Subject not found');
    error.statusCode = 404;
    error.code = 'SUBJECT_NOT_FOUND';
    throw error;
  }

  if (subject.semesterNo !== Number(semesterNo)) {
    const error = new Error('Subject semester does not match provided semesterNo');
    error.statusCode = 400;
    error.code = 'SEMESTER_MISMATCH';
    throw error;
  }

  // Use a transaction to replace exact rows for this student + subject + semesterNo
  const uniqueDays = [...new Set(daysOfWeek)].sort((a, b) => a - b);

  const result = await prisma.$transaction(async (tx) => {
    await tx.classSchedule.deleteMany({
      where: {
        studentId,
        subjectId,
        semesterNo: Number(semesterNo),
      },
    });

    if (uniqueDays.length > 0) {
      await tx.classSchedule.createMany({
        data: uniqueDays.map((dayOfWeek) => ({
          studentId,
          subjectId,
          semesterNo: Number(semesterNo),
          dayOfWeek: Number(dayOfWeek),
        })),
      });
    }

    return await tx.classSchedule.findMany({
      where: {
        studentId,
        subjectId,
        semesterNo: Number(semesterNo),
      },
      orderBy: { dayOfWeek: 'asc' },
    });
  });

  return result;
};

module.exports = {
  getStudentSchedule,
  saveSubjectSchedule,
};
