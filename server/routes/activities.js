const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const activityController = require('../controllers/activityController');

const router = express.Router();

// All routes are protected by auth middleware
router.use(auth);

// @route   GET /api/activities
// @desc    Get all user activities
router.get('/', activityController.getActivities);

// @route   POST /api/activities
// @desc    Create/log an activity
router.post(
  '/',
  [
    check('type', 'Type must be one of: call, email, meeting, note').isIn(['call', 'email', 'meeting', 'note']),
    check('description', 'Description is required').not().isEmpty(),
    check('contactId', 'Contact ID is required').not().isEmpty(),
  ],
  activityController.createActivity
);

module.exports = router;
