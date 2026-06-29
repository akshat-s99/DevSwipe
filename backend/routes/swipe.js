const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getNextProfile, recordSwipe } = require('../controllers/swipeController');

const router = express.Router();

router.get('/next', authMiddleware, getNextProfile);
router.post('/', authMiddleware, recordSwipe);

module.exports = router;
