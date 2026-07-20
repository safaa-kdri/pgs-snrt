const express = require('express');
const interviewController = require('../controllers/interviewController');
const validate = require('../middlewares/validation');
const { authenticate } = require('../middlewares/auth');
const { createInterviewSchema, updateInterviewSchema } = require('../utils/validators');

const router = express.Router();

router.use(authenticate());

router.post('/', validate(createInterviewSchema), interviewController.createInterview);
router.get('/', interviewController.listInterviews);
router.get('/:id', interviewController.getInterviewById);
router.put('/:id', validate(updateInterviewSchema), interviewController.updateInterview);
router.put('/:id/cancel', interviewController.cancelInterview);

module.exports = router;
