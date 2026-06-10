const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const contactController = require('../controllers/contactController');

const router = express.Router();

// All routes are protected by auth middleware
router.use(auth);

// @route   GET /api/contacts
// @desc    Get all contacts (with optional status query param)
router.get('/', contactController.getContacts);

// @route   POST /api/contacts
// @desc    Create a contact
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ],
  contactController.createContact
);

// @route   PUT /api/contacts/:id
// @desc    Update a contact
router.put(
  '/:id',
  [
    check('name', 'Name cannot be empty if provided').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
  ],
  contactController.updateContact
);

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact
router.delete('/:id', contactController.deleteContact);

// @route   POST /api/contacts/:id/notes
// @desc    Add a note to a contact
router.post('/:id/notes', contactController.addNote);

// @route   PUT /api/contacts/:id/reminder
// @desc    Set or update reminder
router.put('/:id/reminder', contactController.updateReminder);

module.exports = router;
