const express = require('express');
const auth = require('../middleware/auth');
const statsController = require('../controllers/statsController');

const router = express.Router();

// @route   GET /api/stats
// @desc    Get dashboard metrics
// @access  Protected
router.get('/', auth, statsController.getStats);

module.exports = router;
