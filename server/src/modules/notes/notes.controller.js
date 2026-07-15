const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');

/**
 * Get current student's notes for a subject/semester
 * GET /api/v1/notes/me
 */
const getMyNotes = async (req, res) => {
  const userId = req.user.id;
  const { subjectId, semesterNo, tag } = req.query;

  const where = { studentId: userId };
  if (subjectId) where.subjectId = subjectId;
  if (semesterNo) where.semesterNo = Number(semesterNo);
  if (tag) where.tag = tag;

  const notes = await prisma.note.findMany({
    where,
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return responseHelper.success(res, { notes }, 'Notes retrieved successfully', 200);
};

/**
 * Create a new personal note
 * POST /api/v1/notes
 */
const createNote = async (req, res) => {
  const userId = req.user.id;
  const { subjectId, semesterNo, title, content, tag = 'GENERAL' } = req.body;

  const note = await prisma.note.create({
    data: {
      studentId: userId,
      subjectId,
      semesterNo,
      title,
      content,
      tag,
    },
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  return responseHelper.success(res, { note }, 'Note created successfully', 201);
};

/**
 * Update personal note
 * PATCH /api/v1/notes/:id
 */
const updateNote = async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const { title, content, tag } = req.body;

  const existingNote = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!existingNote) {
    return responseHelper.error(res, 'Note not found', 404, 'NOTE_NOT_FOUND');
  }

  if (existingNote.studentId !== userId) {
    return responseHelper.error(res, 'You can only modify your own notes', 403, 'FORBIDDEN');
  }

  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(tag !== undefined && { tag }),
    },
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  return responseHelper.success(res, { note: updatedNote }, 'Note updated successfully', 200);
};

/**
 * Delete personal note
 * DELETE /api/v1/notes/:id
 */
const deleteNote = async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  const existingNote = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!existingNote) {
    return responseHelper.error(res, 'Note not found', 404, 'NOTE_NOT_FOUND');
  }

  if (existingNote.studentId !== userId) {
    return responseHelper.error(res, 'You can only delete your own notes', 403, 'FORBIDDEN');
  }

  await prisma.note.delete({
    where: { id: noteId },
  });

  return responseHelper.success(res, { id: noteId }, 'Note deleted successfully', 200);
};

/**
 * Full-text search notes
 * GET /api/v1/notes/me/search
 */
const searchMyNotes = async (req, res) => {
  const userId = req.user.id;
  const { q = '', tag, subjectId } = req.query;

  const where = {
    studentId: userId,
  };

  if (q.trim()) {
    where.OR = [
      { title: { contains: q.trim(), mode: 'insensitive' } },
      { content: { contains: q.trim(), mode: 'insensitive' } },
    ];
  }

  if (tag) where.tag = tag;
  if (subjectId) where.subjectId = subjectId;

  const notes = await prisma.note.findMany({
    where,
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return responseHelper.success(res, { notes }, 'Search results retrieved successfully', 200);
};

module.exports = {
  getMyNotes,
  createNote,
  updateNote,
  deleteNote,
  searchMyNotes,
};
