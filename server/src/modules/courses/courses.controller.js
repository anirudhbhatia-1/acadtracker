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

module.exports = {
  getAllCourses,
};
