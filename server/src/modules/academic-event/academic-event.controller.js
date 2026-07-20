const responseHelper = require('../../utils/responseHelper');
const academicEventService = require('./academic-event.service');

/**
 * Get student visible academic events strictly filtered by server-side courseId and currentSemester.
 * GET /api/v1/academic-events
 */
const getStudentEventsController = async (req, res) => {
  const events = await academicEventService.getStudentEvents(req.user);

  return responseHelper.success(
    res,
    { events },
    'Academic events retrieved successfully',
    200
  );
};

/**
 * Get all academic events for admin dashboard/table.
 * GET /api/v1/admin/academic-events
 */
const getAdminEventsController = async (req, res) => {
  const { courseId, semesterNo } = req.query;
  const events = await academicEventService.getAdminEvents({ courseId, semesterNo });

  return responseHelper.success(
    res,
    { events },
    'Admin academic events retrieved successfully',
    200
  );
};

/**
 * Create a new academic event (Admin only).
 * POST /api/v1/admin/academic-events
 */
const createEventController = async (req, res) => {
  const adminId = req.user.id;
  const event = await academicEventService.createEvent(adminId, req.body);

  return responseHelper.success(
    res,
    { event },
    'Academic event created successfully',
    201
  );
};

/**
 * Update an academic event (Admin only).
 * PATCH /api/v1/admin/academic-events/:id
 */
const updateEventController = async (req, res) => {
  const { id } = req.params;
  const event = await academicEventService.updateEvent(id, req.body);

  return responseHelper.success(
    res,
    { event },
    'Academic event updated successfully',
    200
  );
};

/**
 * Delete an academic event (Admin only).
 * DELETE /api/v1/admin/academic-events/:id
 */
const deleteEventController = async (req, res) => {
  const { id } = req.params;
  await academicEventService.deleteEvent(id);

  return responseHelper.success(
    res,
    { id },
    'Academic event deleted successfully',
    200
  );
};

module.exports = {
  getStudentEventsController,
  getAdminEventsController,
  createEventController,
  updateEventController,
  deleteEventController,
};
