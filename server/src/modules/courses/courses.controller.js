const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');

/**
 * Get all courses
 * GET /api/v1/courses
 */
const getAllCourses = async (req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { name: 'asc' },
  });

  return responseHelper.success(res, { courses }, 'Courses retrieved successfully', 200);
};

/**
 * Create new course (Admin only)
 * POST /api/v1/courses
 */
const createCourse = async (req, res) => {
  const { name, code, department, totalSemesters } = req.body;

  const existingCourse = await prisma.course.findUnique({
    where: { code },
  });

  if (existingCourse) {
    return responseHelper.error(
      res,
      `Course with code '${code}' already exists`,
      409,
      'COURSE_EXISTS'
    );
  }

  const course = await prisma.course.create({
    data: { name, code, department, totalSemesters },
  });

  return responseHelper.success(res, { course }, 'Course created successfully', 201);
};

/**
 * Update existing course (Admin only)
 * PATCH /api/v1/courses/:id
 */
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, code, department, totalSemesters } = req.body;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    return responseHelper.error(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
  }

  if (code && code !== course.code) {
    const existingCode = await prisma.course.findUnique({
      where: { code },
    });
    if (existingCode) {
      return responseHelper.error(res, `Course code '${code}' is already taken`, 409, 'COURSE_CODE_TAKEN');
    }
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(code && { code }),
      ...(department && { department }),
      ...(totalSemesters !== undefined && { totalSemesters }),
    },
  });

  return responseHelper.success(res, { course: updatedCourse }, 'Course updated successfully', 200);
};

/**
 * Delete course (Admin only)
 * DELETE /api/v1/courses/:id
 */
const deleteCourse = async (req, res) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    return responseHelper.error(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
  }

  await prisma.course.delete({
    where: { id },
  });

  return responseHelper.success(res, null, 'Course deleted successfully', 200);
};

/**
 * Get subjects by course id (filter by optional ?semester= number)
 * GET /api/v1/courses/:id/subjects
 */
const getSubjectsByCourse = async (req, res) => {
  const { id } = req.params;
  const { semester, includeArchived } = req.query;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    return responseHelper.error(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
  }

  const whereClause = {
    courseId: id,
    ...(includeArchived !== 'true' && { isArchived: false }),
    ...(semester && !isNaN(parseInt(semester)) && { semesterNo: parseInt(semester) }),
  };

  const subjects = await prisma.subject.findMany({
    where: whereClause,
    orderBy: [{ semesterNo: 'asc' }, { name: 'asc' }],
  });

  return responseHelper.success(res, { subjects }, 'Subjects retrieved successfully', 200);
};

/**
 * Create new subject inside a course (Admin only)
 * POST /api/v1/courses/:id/subjects
 */
const createSubject = async (req, res) => {
  const { id: courseId } = req.params;
  const { name, code, semesterNo, creditHours, type } = req.body;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return responseHelper.error(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
  }

  if (semesterNo > course.totalSemesters) {
    return responseHelper.error(
      res,
      `Semester number (${semesterNo}) exceeds course total semesters (${course.totalSemesters})`,
      400,
      'INVALID_SEMESTER'
    );
  }

  const existingSubject = await prisma.subject.findUnique({
    where: {
      courseId_code: {
        courseId,
        code,
      },
    },
  });

  if (existingSubject) {
    return responseHelper.error(
      res,
      `Subject code '${code}' already exists for this course`,
      409,
      'SUBJECT_EXISTS'
    );
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      code,
      courseId,
      semesterNo,
      creditHours,
      type: type || 'THEORY',
    },
  });

  return responseHelper.success(res, { subject }, 'Subject created successfully', 201);
};

module.exports = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getSubjectsByCourse,
  createSubject,
};
