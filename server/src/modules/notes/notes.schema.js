const { z } = require('zod');

const createNoteSchema = z.object({
  body: z.object({
    subjectId: z.string().min(1, 'Subject ID is required'),
    semesterNo: z.number().int().positive('Semester number must be positive'),
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Note content is required'),
    tag: z.enum(['LECTURE_NOTES', 'SUMMARY', 'FORMULA_SHEET', 'REVISION', 'GENERAL']).optional(),
  }),
});

const updateNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    tag: z.enum(['LECTURE_NOTES', 'SUMMARY', 'FORMULA_SHEET', 'REVISION', 'GENERAL']).optional(),
  }),
});

const getNotesQuerySchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    semesterNo: z.string().optional(),
    tag: z.enum(['LECTURE_NOTES', 'SUMMARY', 'FORMULA_SHEET', 'REVISION', 'GENERAL']).optional(),
  }),
});

const searchNotesQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    tag: z.enum(['LECTURE_NOTES', 'SUMMARY', 'FORMULA_SHEET', 'REVISION', 'GENERAL']).optional(),
    subjectId: z.string().optional(),
  }),
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  getNotesQuerySchema,
  searchNotesQuerySchema,
};
