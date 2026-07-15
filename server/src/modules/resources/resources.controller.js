const prisma = require('../../config/db');
const responseHelper = require('../../utils/responseHelper');

/**
 * Get all resources for a subject/semester (pinned first, then personal)
 * GET /api/v1/resources
 */
const getResources = async (req, res) => {
  const userId = req.user.id;
  const { subjectId, semesterNo, type } = req.query;

  const where = {
    OR: [
      { isPinned: true },
      { addedById: userId },
    ],
  };

  if (subjectId) where.subjectId = subjectId;
  if (semesterNo) where.semesterNo = Number(semesterNo);
  if (type) where.type = type;

  const resources = await prisma.resource.findMany({
    where,
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
      addedBy: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return responseHelper.success(res, { resources }, 'Resources retrieved successfully', 200);
};

/**
 * Student adds personal resource link
 * POST /api/v1/resources
 */
const createResource = async (req, res) => {
  const userId = req.user.id;
  const { subjectId, semesterNo, title, url, type = 'OTHER' } = req.body;

  const resource = await prisma.resource.create({
    data: {
      subjectId,
      addedById: userId,
      semesterNo,
      title,
      url,
      type,
      isPinned: false,
    },
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
      addedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  return responseHelper.success(res, { resource }, 'Personal resource link created successfully', 201);
};

/**
 * Student or Admin edits own resource
 * PATCH /api/v1/resources/:id
 */
const updateResource = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const resourceId = req.params.id;
  const { title, url, type } = req.body;

  const existingResource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existingResource) {
    return responseHelper.error(res, 'Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }

  if (existingResource.addedById !== userId && userRole !== 'ADMIN') {
    return responseHelper.error(res, 'You can only modify your own resource links', 403, 'FORBIDDEN');
  }

  const updatedResource = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      ...(title !== undefined && { title }),
      ...(url !== undefined && { url }),
      ...(type !== undefined && { type }),
    },
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
      addedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  return responseHelper.success(res, { resource: updatedResource }, 'Resource link updated successfully', 200);
};

/**
 * Student or Admin deletes own resource
 * DELETE /api/v1/resources/:id
 */
const deleteResource = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const resourceId = req.params.id;

  const existingResource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existingResource) {
    return responseHelper.error(res, 'Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }

  if (existingResource.addedById !== userId && userRole !== 'ADMIN') {
    return responseHelper.error(res, 'You can only delete your own resource links', 403, 'FORBIDDEN');
  }

  await prisma.resource.delete({
    where: { id: resourceId },
  });

  return responseHelper.success(res, { id: resourceId }, 'Resource link deleted successfully', 200);
};

/**
 * Admin pins resource
 * POST /api/v1/resources/pin
 */
const createPinnedResource = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return responseHelper.error(res, 'Only admins can pin resources', 403, 'FORBIDDEN');
  }

  const adminId = req.user.id;
  const { subjectId, semesterNo, title, url, type = 'OTHER' } = req.body;

  const resource = await prisma.resource.create({
    data: {
      subjectId,
      addedById: adminId,
      semesterNo,
      title,
      url,
      type,
      isPinned: true,
    },
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
      addedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  return responseHelper.success(res, { resource }, 'Pinned resource created successfully', 201);
};

/**
 * Admin edits pinned resource
 * PATCH /api/v1/resources/pin/:id
 */
const updatePinnedResource = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return responseHelper.error(res, 'Only admins can modify pinned resources', 403, 'FORBIDDEN');
  }

  const resourceId = req.params.id;
  const { title, url, type } = req.body;

  const existingResource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existingResource) {
    return responseHelper.error(res, 'Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }

  const updatedResource = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      ...(title !== undefined && { title }),
      ...(url !== undefined && { url }),
      ...(type !== undefined && { type }),
      isPinned: true,
    },
    include: {
      subject: {
        select: { id: true, code: true, name: true },
      },
      addedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  return responseHelper.success(res, { resource: updatedResource }, 'Pinned resource updated successfully', 200);
};

/**
 * Admin removes pinned resource
 * DELETE /api/v1/resources/pin/:id
 */
const deletePinnedResource = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return responseHelper.error(res, 'Only admins can delete pinned resources', 403, 'FORBIDDEN');
  }

  const resourceId = req.params.id;

  const existingResource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existingResource) {
    return responseHelper.error(res, 'Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }

  await prisma.resource.delete({
    where: { id: resourceId },
  });

  return responseHelper.success(res, { id: resourceId }, 'Pinned resource deleted successfully', 200);
};

module.exports = {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  createPinnedResource,
  updatePinnedResource,
  deletePinnedResource,
};
