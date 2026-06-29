const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/', getProfile);
router.put('/', updateProfile);
module.exports = router;
