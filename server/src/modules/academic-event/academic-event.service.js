const prisma = require('../../config/db');

/**
 * Get events visible to a student based strictly on their server-side courseId and currentSemester.
 * Never trusts client parameters per rules.md §9.
 */
async function getStudentEvents(user) {
  const courseFilter = user.courseId
    ? [{ courseId: null }, { courseId: user.courseId }]
    : [{ courseId: null }];

  const semesterFilter = user.currentSemester != null
    ? [{ semesterNo: null }, { semesterNo: Number(user.currentSemester) }]
    : [{ semesterNo: null }];

  const events = await prisma.academicEvent.findMany({
    where: {
      AND: [
        { OR: courseFilter },
        { OR: semesterFilter },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      type: true,
      courseId: true,
      semesterNo: true,
      course: {
        select: { id: true, name: true, code: true },
      },
    },
    orderBy: { date: 'asc' },
  });

  return events;
}

/**
 * Get all academic events for admin view, optionally filtered by courseId or semesterNo.
 */
async function getAdminEvents({ courseId, semesterNo } = {}) {
  const where = {};
  if (courseId !== undefined && courseId !== '') {
    where.courseId = courseId === 'GLOBAL' ? null : courseId;
  }
  if (semesterNo !== undefined && semesterNo !== '') {
    where.semesterNo = semesterNo === 'GLOBAL' ? null : Number(semesterNo);
  }

  const events = await prisma.academicEvent.findMany({
    where,
    include: {
      course: {
        select: { id: true, name: true, code: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { date: 'asc' },
  });

  return events;
}

/**
 * Create a new academic event (Admin only).
 */
async function createEvent(adminId, data) {
  const { title, description, date, type, courseId, semesterNo } = data;

  const event = await prisma.academicEvent.create({
    data: {
      title,
      description: description || null,
      date: new Date(date),
      type,
      courseId: courseId ? courseId : null,
      semesterNo: semesterNo != null && semesterNo !== '' ? Number(semesterNo) : null,
      createdById: adminId,
    },
    include: {
      course: { select: { id: true, name: true, code: true } },
    },
  });

  return event;
}

/**
 * Update an existing academic event (Admin only).
 */
async function updateEvent(eventId, data) {
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.courseId !== undefined) updateData.courseId = data.courseId ? data.courseId : null;
  if (data.semesterNo !== undefined) updateData.semesterNo = data.semesterNo != null && data.semesterNo !== '' ? Number(data.semesterNo) : null;

  const event = await prisma.academicEvent.update({
    where: { id: eventId },
    data: updateData,
    include: {
      course: { select: { id: true, name: true, code: true } },
    },
  });

  return event;
}

/**
 * Delete an academic event (Admin only).
 */
async function deleteEvent(eventId) {
  await prisma.academicEvent.delete({
    where: { id: eventId },
  });
  return true;
}

module.exports = {
  getStudentEvents,
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
