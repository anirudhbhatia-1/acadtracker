const express = require('express');
const router = express.Router();
const resourcesController = require('./resources.controller');
const {
  createResourceSchema,
  updateResourceSchema,
  getResourcesQuerySchema,
} = require('./resources.schema');
const authenticate = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authenticate);

router.post('/pin', isAdmin, validate(createResourceSchema), resourcesController.createPinnedResource);
router.patch('/pin/:id', isAdmin, validate(updateResourceSchema), resourcesController.updatePinnedResource);
router.delete('/pin/:id', isAdmin, resourcesController.deletePinnedResource);

router.get('/', validate(getResourcesQuerySchema), resourcesController.getResources);
router.post('/', validate(createResourceSchema), resourcesController.createResource);
router.patch('/:id', validate(updateResourceSchema), resourcesController.updateResource);
router.delete('/:id', resourcesController.deleteResource);

module.exports = router;
