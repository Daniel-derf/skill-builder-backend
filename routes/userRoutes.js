// routes/userRoutes.js

const express = require('express');
const {getUserData, getLoggedUser, increaseUserXP} = require('../controllers/userControllers');
const checkToken = require('../middleware/authMiddleware');

const router = express.Router()

router.get('/me', checkToken, getLoggedUser);
router.get('/:id', checkToken, getUserData);
router.post('/:id/xp', checkToken, increaseUserXP);

module.exports = router;