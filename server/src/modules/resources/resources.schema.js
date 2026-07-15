const { z } = require('zod');

const createResourceSchema = z.object({
  body: z.object({
    subjectId: z.string().min(1, 'Subject ID is required'),
    semesterNo: z.number().int().positive('Semester number must be positive'),
    title: z.string().min(1, 'Title is required').max(200),
    url: z.string().url('Must be a valid URL'),
    type: z.enum(['YOUTUBE', 'ARTICLE', 'GOOGLE_DRIVE', 'OTHER']).optional(),
  }),
});

const updateResourceSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    url: z.string().url('Must be a valid URL').optional(),
    type: z.enum(['YOUTUBE', 'ARTICLE', 'GOOGLE_DRIVE', 'OTHER']).optional(),
  }),
});

const getResourcesQuerySchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    semesterNo: z.string().optional(),
    type: z.enum(['YOUTUBE', 'ARTICLE', 'GOOGLE_DRIVE', 'OTHER']).optional(),
  }),
});

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  getResourcesQuerySchema,
};
