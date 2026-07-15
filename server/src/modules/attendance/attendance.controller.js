const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');
const { getAttendanceSummary } = require('../../utils/attendanceUtils');

/**
 * Get current student's attendance records with helper formulas
 * GET /api/v1/attendance/me
 */
const getMyAttendance = async (req, res) => {
  const studentId = req.user.id;

  const records = await prisma.attendance.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
  });

  const enrichedRecords = records.map((record) => ({
    ...record,
    summary: getAttendanceSummary(record),
  }));

  return responseHelper.success(
    res,
    { attendance: enrichedRecords },
    'Attendance retrieved successfully',
    200
  );
};

/**
 * Log attendance for a subject (increment total + attended based on action)
 * POST /api/v1/attendance/log
 */
const logAttendance = async (req, res) => {
  const studentId = req.user.id;
  const { subjectId, semesterNo, action, totalIncrement, attendedIncrement } = req.body;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return responseHelper.error(res, 'Subject not found', 404, 'SUBJECT_NOT_FOUND');
  }

  const addTotal = totalIncrement !== undefined ? totalIncrement : 1;
  const addAttended = action === 'MISSED' ? 0 : (attendedIncrement !== undefined ? attendedIncrement : 1);

  const record = await prisma.attendance.upsert({
    where: {
      studentId_subjectId_semesterNo: {
        studentId,
        subjectId,
        semesterNo,
      },
    },
    create: {
      studentId,
      subjectId,
      semesterNo,
      totalClasses: addTotal,
      attendedClasses: addAttended,
    },
    update: {
      totalClasses: { increment: addTotal },
      attendedClasses: { increment: addAttended },
    },
    include: { subject: true },
  });

  const summary = getAttendanceSummary(record);

  return responseHelper.success(
    res,
    { attendance: { ...record, summary } },
    'Attendance logged successfully',
    200
  );
};

/**
 * Student corrects own attendance record by ID
 * PATCH /api/v1/attendance/:id
 */
const updateMyAttendance = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;
  const { totalClasses, attendedClasses } = req.body;

  const existingRecord = await prisma.attendance.findUnique({
    where: { id },
  });

  if (!existingRecord || existingRecord.studentId !== studentId) {
    return responseHelper.error(res, 'Attendance record not found', 404, 'ATTENDANCE_NOT_FOUND');
  }

  const newTotal = totalClasses !== undefined ? totalClasses : existingRecord.totalClasses;
  const newAttended = attendedClasses !== undefined ? attendedClasses : existingRecord.attendedClasses;

  if (newAttended > newTotal) {
    return responseHelper.error(res, 'Attended classes cannot exceed total classes', 400, 'INVALID_ATTENDANCE');
  }

  const updatedRecord = await prisma.attendance.update({
    where: { id },
    data: {
      totalClasses: newTotal,
      attendedClasses: newAttended,
    },
    include: { subject: true },
  });

  const summary = getAttendanceSummary(updatedRecord);

  return responseHelper.success(
    res,
    { attendance: { ...updatedRecord, summary } },
    'Attendance updated successfully',
    200
  );
};

/**
 * Admin views any student's attendance
 * GET /api/v1/attendance/student/:id
 */
const getStudentAttendance = async (req, res) => {
  const { id: studentId } = req.params;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return responseHelper.error(res, 'Student not found', 404, 'STUDENT_NOT_FOUND');
  }

  const records = await prisma.attendance.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
  });

  const enrichedRecords = records.map((record) => ({
    ...record,
    summary: getAttendanceSummary(record),
  }));

  return responseHelper.success(
    res,
    { student: { id: student.id, name: student.name, email: student.email }, attendance: enrichedRecords },
    'Student attendance retrieved successfully',
    200
  );
};

/**
 * Admin edits any student's specific attendance by studentId & subjectId
 * PATCH /api/v1/attendance/student/:id/:subjectId
 */
const updateStudentAttendanceBySubject = async (req, res) => {
  const { id: studentId, subjectId } = req.params;
  const { totalClasses, attendedClasses, semesterNo } = req.body;

  const existingRecord = await prisma.attendance.findFirst({
    where: {
      studentId,
      subjectId,
      ...(semesterNo && { semesterNo }),
    },
  });

  if (!existingRecord) {
    return responseHelper.error(res, 'Attendance record not found for this student and subject', 404, 'ATTENDANCE_NOT_FOUND');
  }

  const newTotal = totalClasses !== undefined ? totalClasses : existingRecord.totalClasses;
  const newAttended = attendedClasses !== undefined ? attendedClasses : existingRecord.attendedClasses;

  if (newAttended > newTotal) {
    return responseHelper.error(res, 'Attended classes cannot exceed total classes', 400, 'INVALID_ATTENDANCE');
  }

  const updatedRecord = await prisma.attendance.update({
    where: { id: existingRecord.id },
    data: {
      totalClasses: newTotal,
      attendedClasses: newAttended,
    },
    include: { subject: true },
  });

  const summary = getAttendanceSummary(updatedRecord);

  return responseHelper.success(
    res,
    { attendance: { ...updatedRecord, summary } },
    'Student attendance updated successfully by admin',
    200
  );
};

module.exports = {
  getMyAttendance,
  logAttendance,
  updateMyAttendance,
  getStudentAttendance,
  updateStudentAttendanceBySubject,
};
