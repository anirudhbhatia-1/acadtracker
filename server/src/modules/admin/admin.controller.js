const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');
const { computeSGPAsAndCGPA } = require('../grades/grades.controller');

/**
 * Helper to compute student live stats (CGPA, attendance health, at-risk status)
 */
const getStudentStats = async (student, preloadedGrades = null, preloadedAttendance = null) => {
  const { cgpa, semesterSGPAs } = await computeSGPAsAndCGPA(student.id, preloadedGrades);

  // Check attendance records for this student
  const attendanceRecords = preloadedAttendance || await prisma.attendance.findMany({
    where: { studentId: student.id },
    include: { subject: true },
  });

  let lowAttendanceCount = 0;
  const attendanceWithPct = attendanceRecords.map((att) => {
    const pct = att.totalClasses > 0
      ? Number(((att.attendedClasses / att.totalClasses) * 100).toFixed(1))
      : 100.0;
    if (pct < 75.0 && att.totalClasses > 0) {
      lowAttendanceCount++;
    }
    return {
      ...att,
      summary: {
        totalClasses: att.totalClasses,
        attendedClasses: att.attendedClasses,
        percentage: pct,
        isSafe: pct >= 75.0,
      },
    };
  });

  const totalSubjectsWithAttendance = attendanceRecords.length;
  const safeAttendanceCount = totalSubjectsWithAttendance - lowAttendanceCount;
  const attendanceHealthPct = totalSubjectsWithAttendance > 0
    ? Number(((safeAttendanceCount / totalSubjectsWithAttendance) * 100).toFixed(1))
    : 100.0;

  const reasons = [];
  if (lowAttendanceCount > 0) {
    reasons.push('attendance_low');
  }
  if (cgpa < 5.0 && Object.keys(semesterSGPAs).length > 0) {
    reasons.push('cgpa_low');
  }

  const isAtRisk = reasons.length > 0;

  return {
    ...student,
    cgpa,
    semesterSGPAs,
    attendanceHealthPct,
    lowAttendanceSubjectsCount: lowAttendanceCount,
    isAtRisk,
    atRiskReasons: reasons,
    attendanceDetails: attendanceWithPct,
  };
};

/**
 * List all students (filter by course, semester, search)
 * GET /api/v1/admin/students
 */
const getStudents = async (req, res) => {
  const { courseId, semesterNo, search, atRiskOnly } = req.query;

  const whereClause = {
    role: 'STUDENT',
  };

  if (courseId) {
    whereClause.courseId = courseId;
  }
  if (semesterNo) {
    whereClause.currentSemester = Number(semesterNo);
  }
  if (search && search.trim() !== '') {
    whereClause.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { email: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const page = Math.max(1, parseInt(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || 50)));
  const skip = (page - 1) * limit;

  const students = await prisma.user.findMany({
    where: whereClause,
    include: {
      course: true,
      _count: {
        select: {
          attendance: true,
          grades: true,
          tasks: true,
        },
      },
    },
    orderBy: { name: 'asc' },
    take: limit,
    skip: skip,
  });

  const studentIds = students.map((s) => s.id);
  const allGrades = await prisma.grade.findMany({
    where: { studentId: { in: studentIds } },
    include: { subject: true },
    orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
  });
  const allAttendance = await prisma.attendance.findMany({
    where: { studentId: { in: studentIds } },
    include: { subject: true },
  });

  const gradesByStudent = {};
  const attendanceByStudent = {};
  for (const id of studentIds) {
    gradesByStudent[id] = [];
    attendanceByStudent[id] = [];
  }
  for (const g of allGrades) {
    if (gradesByStudent[g.studentId]) gradesByStudent[g.studentId].push(g);
  }
  for (const att of allAttendance) {
    if (attendanceByStudent[att.studentId]) attendanceByStudent[att.studentId].push(att);
  }

  const studentsWithStats = await Promise.all(
    students.map(async (st) => {
      const stats = await getStudentStats(
        st,
        gradesByStudent[st.id] || [],
        attendanceByStudent[st.id] || []
      );
      return stats;
    })
  );

  let finalStudents = studentsWithStats;
  if (atRiskOnly === 'true') {
    finalStudents = studentsWithStats.filter((s) => s.isAtRisk);
  }

  return responseHelper.success(
    res,
    { students: finalStudents, count: finalStudents.length },
    'Students retrieved successfully',
    200
  );
};

/**
 * Get full student profile (attendance + grades + tasks + stats)
 * Admin CANNOT see personal notes or personal unpinned resources of student per Phase 5 spec.
 * GET /api/v1/admin/students/:id
 */
const getStudentProfile = async (req, res) => {
  const { id } = req.params;

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      course: true,
      attendance: {
        include: { subject: true },
        orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
      },
      grades: {
        include: { subject: true },
        orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
      },
      tasks: {
        include: { subject: true },
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!student || student.role !== 'STUDENT') {
    return responseHelper.error(res, 'Student not found', 404, 'STUDENT_NOT_FOUND');
  }

  const stats = await getStudentStats(student);

  // Admin view: include course pinned resources, but explicitly exclude personal notes & personal resources
  const pinnedResources = student.courseId
    ? await prisma.resource.findMany({
        where: {
          subject: { courseId: student.courseId },
          isPinned: true,
        },
        include: { subject: true, addedBy: { select: { id: true, name: true } } },
      })
    : [];

  // Structure response clearly ensuring privacy compliance
  const profileData = {
    ...stats,
    pinnedResources,
  };

  return responseHelper.success(res, { profile: profileData }, 'Student profile retrieved successfully', 200);
};

/**
 * Promote student to next semester
 * PATCH /api/v1/admin/students/:id/semester
 */
const promoteStudentSemester = async (req, res) => {
  const { id } = req.params;
  const { currentSemester } = req.body;

  const student = await prisma.user.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!student || student.role !== 'STUDENT') {
    return responseHelper.error(res, 'Student not found', 404, 'STUDENT_NOT_FOUND');
  }

  let targetSemester;
  if (currentSemester !== undefined) {
    targetSemester = Number(currentSemester);
  } else {
    targetSemester = (student.currentSemester || 1) + 1;
  }

  if (student.course && targetSemester > student.course.totalSemesters) {
    return responseHelper.error(
      res,
      `Cannot promote beyond total course semesters (${student.course.totalSemesters})`,
      400,
      'MAX_SEMESTER_REACHED'
    );
  }

  const updatedStudent = await prisma.user.update({
    where: { id },
    data: { currentSemester: targetSemester },
    include: { course: true },
  });

  return responseHelper.success(res, { student: updatedStudent }, `Student promoted to Semester ${targetSemester}`, 200);
};

/**
 * Change student's course
 * PATCH /api/v1/admin/students/:id/course
 */
const changeStudentCourse = async (req, res) => {
  const { id } = req.params;
  const { courseId, currentSemester } = req.body;

  const student = await prisma.user.findUnique({
    where: { id },
  });

  if (!student || student.role !== 'STUDENT') {
    return responseHelper.error(res, 'Student not found', 404, 'STUDENT_NOT_FOUND');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return responseHelper.error(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
  }

  const newSemester = currentSemester !== undefined ? Number(currentSemester) : 1;

  const updatedStudent = await prisma.user.update({
    where: { id },
    data: {
      courseId,
      currentSemester: newSemester,
    },
    include: { course: true },
  });

  return responseHelper.success(res, { student: updatedStudent }, `Student course changed to ${course.name}`, 200);
};

/**
 * Platform analytics overview
 * GET /api/v1/admin/analytics
 */
const getAnalytics = async (req, res) => {
  const allStudents = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: { course: true },
  });

  const totalStudents = allStudents.length;
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { students: true, subjects: true } },
    },
  });

  const totalCourses = courses.length;

  // Compute stats across all students
  let totalCGPA = 0;
  let studentsWithGradesCount = 0;
  let atRiskCount = 0;

  const courseStatsMap = {};
  courses.forEach((c) => {
    courseStatsMap[c.id] = {
      courseId: c.id,
      courseName: c.name,
      courseCode: c.code,
      totalStudents: c._count.students,
      totalSubjects: c._count.subjects,
      cgpaSum: 0,
      studentsWithGrades: 0,
    };
  });

  const studentIds = allStudents.map((s) => s.id);
  const allGrades = await prisma.grade.findMany({
    where: { studentId: { in: studentIds } },
    include: { subject: true },
    orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
  });
  const allAttendanceRecords = await prisma.attendance.findMany({
    where: { studentId: { in: studentIds } },
    include: { subject: true },
  });

  const gradesByStudent = {};
  const attendanceByStudent = {};
  for (const id of studentIds) {
    gradesByStudent[id] = [];
    attendanceByStudent[id] = [];
  }
  for (const g of allGrades) {
    if (gradesByStudent[g.studentId]) gradesByStudent[g.studentId].push(g);
  }
  for (const att of allAttendanceRecords) {
    if (attendanceByStudent[att.studentId]) attendanceByStudent[att.studentId].push(att);
  }

  for (const st of allStudents) {
    const stats = await getStudentStats(
      st,
      gradesByStudent[st.id] || [],
      attendanceByStudent[st.id] || []
    );
    if (stats.cgpa > 0) {
      totalCGPA += stats.cgpa;
      studentsWithGradesCount++;
      if (st.courseId && courseStatsMap[st.courseId]) {
        courseStatsMap[st.courseId].cgpaSum += stats.cgpa;
        courseStatsMap[st.courseId].studentsWithGrades++;
      }
    }
    if (stats.isAtRisk) {
      atRiskCount++;
    }
  }

  const avgCGPA = studentsWithGradesCount > 0
    ? Number((totalCGPA / studentsWithGradesCount).toFixed(2))
    : 0;

  const courseBreakdown = Object.values(courseStatsMap).map((c) => ({
    courseId: c.courseId,
    courseName: c.courseName,
    courseCode: c.courseCode,
    totalStudents: c.totalStudents,
    totalSubjects: c.totalSubjects,
    avgCGPA: c.studentsWithGrades > 0 ? Number((c.cgpaSum / c.studentsWithGrades).toFixed(2)) : 0,
  }));

  // Task stats
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({ where: { status: 'DONE' } });
  const taskCompletionRate = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

  // Attendance health distribution across all student-subject pairs
  const allAttendance = await prisma.attendance.findMany();
  let totalAttendancePairs = allAttendance.length;
  let safeAttendancePairs = 0;
  allAttendance.forEach((att) => {
    const pct = att.totalClasses > 0 ? (att.attendedClasses / att.totalClasses) * 100 : 100;
    if (pct >= 75) safeAttendancePairs++;
  });
  const overallAttendanceHealth = totalAttendancePairs > 0
    ? Number(((safeAttendancePairs / totalAttendancePairs) * 100).toFixed(1))
    : 100.0;

  return responseHelper.success(
    res,
    {
      totalStudents,
      totalCourses,
      avgCGPA,
      atRiskCount,
      taskCompletionRate,
      overallAttendanceHealth,
      courseBreakdown,
    },
    'Analytics retrieved successfully',
    200
  );
};

/**
 * Get at-risk students list
 * GET /api/v1/admin/at-risk
 */
const getAtRiskStudents = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || 50)));
  const skip = (page - 1) * limit;

  const allStudents = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      course: true,
      _count: { select: { attendance: true, grades: true } },
    },
    orderBy: { name: 'asc' },
    take: limit,
    skip: skip,
  });

  const studentIds = allStudents.map((s) => s.id);
  const allGrades = await prisma.grade.findMany({
    where: { studentId: { in: studentIds } },
    include: { subject: true },
    orderBy: [{ semesterNo: 'asc' }, { subject: { name: 'asc' } }],
  });
  const allAttendanceRecords = await prisma.attendance.findMany({
    where: { studentId: { in: studentIds } },
    include: { subject: true },
  });

  const gradesByStudent = {};
  const attendanceByStudent = {};
  for (const id of studentIds) {
    gradesByStudent[id] = [];
    attendanceByStudent[id] = [];
  }
  for (const g of allGrades) {
    if (gradesByStudent[g.studentId]) gradesByStudent[g.studentId].push(g);
  }
  for (const att of allAttendanceRecords) {
    if (attendanceByStudent[att.studentId]) attendanceByStudent[att.studentId].push(att);
  }

  const studentsStats = await Promise.all(
    allStudents.map((s) => getStudentStats(s, gradesByStudent[s.id] || [], attendanceByStudent[s.id] || []))
  );
  const atRiskStudents = studentsStats.filter((s) => s.isAtRisk);

  return responseHelper.success(
    res,
    { atRiskStudents, count: atRiskStudents.length },
    'At-risk students retrieved successfully',
    200
  );
};

module.exports = {
  getStudents,
  getStudentProfile,
  promoteStudentSemester,
  changeStudentCourse,
  getAnalytics,
  getAtRiskStudents,
};
