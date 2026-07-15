const express = require('express');
const router = express.Router();
const predictorController = require('./predictor.controller');
const { simulateSchema } = require('./predictor.schema');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authenticate);

router.post('/simulate', validate(simulateSchema), predictorController.simulateCGPA);

module.exports = router;
