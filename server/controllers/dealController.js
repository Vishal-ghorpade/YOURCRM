const { validationResult } = require('express-validator');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const Contact = require('../models/Contact');

// TODO: add pagination — currently returns all records
exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ userId: req.user.id })
      .populate('contactId', 'name email company')
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createDeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, contactId, value, stage } = req.body;

  try {
    const contact = await Contact.findOne({ _id: contactId, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const newDeal = new Deal({
      userId: req.user.id,
      title,
      contactId,
      value,
      stage: stage || 'new',
    });

    const deal = await newDeal.save();

    // Log activity
    const activity = new Activity({
      userId: req.user.id,
      type: 'note',
      description: `Created deal "${title}" valued at ₹${value} for ${contact.name}.`,
      contactId: contactId,
    });
    await activity.save();

    // Populate contact data for response
    const populatedDeal = await Deal.findById(deal._id).populate('contactId', 'name email company');

    res.status(201).json(populatedDeal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateDeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, value, stage, contactId } = req.body;

  try {
    let deal = await Deal.findOne({ _id: req.params.id, userId: req.user.id }).populate('contactId', 'name');
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const oldStage = deal.stage;

    deal.title = title !== undefined ? title : deal.title;
    deal.value = value !== undefined ? value : deal.value;
    deal.stage = stage !== undefined ? stage : deal.stage;
    deal.contactId = contactId !== undefined ? contactId : deal.contactId;

    await deal.save();

    // Log activity if stage changed
    if (stage && stage !== oldStage) {
      const activity = new Activity({
        userId: req.user.id,
        type: 'note',
        description: `Deal "${deal.title}" stage changed from ${oldStage} to ${stage}.`,
        contactId: deal.contactId._id,
      });
      await activity.save();
    }

    const populatedDeal = await Deal.findById(deal._id).populate('contactId', 'name email company');
    res.json(populatedDeal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    await Deal.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deal removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
