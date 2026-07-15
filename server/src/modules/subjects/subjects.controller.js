const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');

/**
 * Update subject (Admin only)
 * PATCH /api/v1/subjects/:id
 */
const updateSubject = async (req, res) => {
  const { id } = req.params;
  const { name, code, semesterNo, creditHours, type, isArchived } = req.body;

  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    return responseHelper.error(res, 'Subject not found', 404, 'SUBJECT_NOT_FOUND');
  }

  if (code && code !== subject.code) {
    const existingCode = await prisma.subject.findUnique({
      where: {
        courseId_code: {
          courseId: subject.courseId,
          code,
        },
      },
    });
    if (existingCode) {
      return responseHelper.error(
        res,
        `Subject code '${code}' already exists for this course`,
        409,
        'SUBJECT_CODE_TAKEN'
      );
    }
  }

  const updatedSubject = await prisma.subject.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(code && { code }),
      ...(semesterNo !== undefined && { semesterNo }),
      ...(creditHours !== undefined && { creditHours }),
      ...(type && { type }),
      ...(isArchived !== undefined && { isArchived }),
    },
  });

  return responseHelper.success(res, { subject: updatedSubject }, 'Subject updated successfully', 200);
};

/**
 * Archive subject (Admin only) - sets isArchived = true per rules/phases
 * DELETE /api/v1/subjects/:id
 */
const archiveSubject = async (req, res) => {
  const { id } = req.params;

  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    return responseHelper.error(res, 'Subject not found', 404, 'SUBJECT_NOT_FOUND');
  }

  const archivedSubject = await prisma.subject.update({
    where: { id },
    data: { isArchived: true },
  });

  return responseHelper.success(res, { subject: archivedSubject }, 'Subject archived successfully', 200);
};

module.exports = {
  updateSubject,
  archiveSubject,
};
