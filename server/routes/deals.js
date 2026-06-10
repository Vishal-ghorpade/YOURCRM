const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const dealController = require('../controllers/dealController');

const router = express.Router();

// All routes are protected by auth middleware
router.use(auth);

// @route   GET /api/deals
// @desc    Get all user deals
router.get('/', dealController.getDeals);

// @route   POST /api/deals
// @desc    Create a deal
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('contactId', 'Contact ID is required').not().isEmpty(),
    check('value', 'Value is required and must be a number').isNumeric(),
  ],
  dealController.createDeal
);

// @route   PUT /api/deals/:id
// @desc    Update a deal
router.put(
  '/:id',
  [
    check('title', 'Title cannot be empty if provided').optional().not().isEmpty(),
    check('value', 'Value must be a number if provided').optional().isNumeric(),
  ],
  dealController.updateDeal
);

// @route   DELETE /api/deals/:id
// @desc    Delete a deal
router.delete('/:id', dealController.deleteDeal);

module.exports = router;
