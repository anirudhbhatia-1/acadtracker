const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');

/**
 * Select course and current semester during student onboarding
 * POST /api/v1/onboarding/select-course
 */
const selectCourse = async (req, res) => {
  const { courseId, currentSemester } = req.body;

  // Check if user is already onboarded
  if (req.user.isOnboarded) {
    return responseHelper.error(res, 'User is already onboarded. Course selection cannot be repeated.', 400);
  }

  // Verify that the course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return responseHelper.error(res, 'Selected course does not exist', 404);
  }

  // Validate semester number against total semesters of the course
  if (currentSemester > course.totalSemesters) {
    return responseHelper.error(
      res,
      `Selected semester (${currentSemester}) exceeds the total semesters for ${course.name} (${course.totalSemesters})`,
      400
    );
  }

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      courseId,
      currentSemester,
      isOnboarded: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePic: true,
      courseId: true,
      currentSemester: true,
      isOnboarded: true,
      createdAt: true,
      course: true,
    },
  });

  return responseHelper.success(res, { user: updatedUser }, 'Course selected and onboarding completed successfully', 200);
};

module.exports = {
  selectCourse,
};
