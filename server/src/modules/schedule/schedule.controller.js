const responseHelper = require('../../utils/responseHelper');
const scheduleService = require('./schedule.service');

/**
 * Get current student's class schedules
 * GET /api/v1/schedule/me?semesterNo=
 */
const getMySchedule = async (req, res) => {
  const studentId = req.user.id;
  const { semesterNo } = req.query;

  const schedules = await scheduleService.getStudentSchedule(studentId, semesterNo);

  return responseHelper.success(
    res,
    { schedules },
    'Schedules retrieved successfully',
    200
  );
};

/**
 * Save / replace class schedule for a subject + semester
 * POST /api/v1/schedule/me
 */
const saveMySchedule = async (req, res) => {
  const studentId = req.user.id;
  const { subjectId, semesterNo, daysOfWeek } = req.body;

  try {
    const schedules = await scheduleService.saveSubjectSchedule(
      studentId,
      subjectId,
      Number(semesterNo),
      daysOfWeek
    );

    return responseHelper.success(
      res,
      { schedules },
      'Schedule saved successfully',
      200
    );
  } catch (error) {
    if (error.statusCode) {
      return responseHelper.error(res, error.message, error.statusCode, error.code);
    }
    throw error;
  }
};

module.exports = {
  getMySchedule,
  saveMySchedule,
};
