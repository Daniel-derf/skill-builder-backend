// routes/interestRoutes.js

const express = require('express');
const interestController = require('../controllers/interestControllers');
const checkToken = require('../middleware/authMiddleware');

const router = express.Router()

router.get('/', checkToken, interestController.getInterests);
router.get('/:id/task', checkToken, interestController.getInterestTasks);
router.post('/:id/task/:taskId/finish', checkToken, interestController.finishInterestTask);

module.exports = router;
