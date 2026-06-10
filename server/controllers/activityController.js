const { validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const Contact = require('../models/Contact');

// TODO: add pagination — currently returns all records
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .populate('contactId', 'name email company')
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createActivity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, description, contactId } = req.body;

  try {
    const contact = await Contact.findOne({ _id: contactId, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const newActivity = new Activity({
      userId: req.user.id,
      type,
      description,
      contactId,
    });

    const activity = await newActivity.save();
    const populatedActivity = await Activity.findById(activity._id).populate('contactId', 'name email company');

    res.status(201).json(populatedActivity);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
