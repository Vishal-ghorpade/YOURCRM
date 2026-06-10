const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const Deal = require('../models/Deal');

// TODO: add pagination — currently returns all records
exports.getContacts = async (req, res) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.status) {
      query.status = req.query.status;
    }
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, company, status } = req.body;

  try {
    const newContact = new Contact({
      userId: req.user.id,
      name,
      email,
      phone,
      company,
      status: status || 'lead',
    });

    const contact = await newContact.save();

    // Log an activity for contact creation
    const activity = new Activity({
      userId: req.user.id,
      type: 'note',
      description: `Contact ${name} was created.`,
      contactId: contact._id,
    });
    await activity.save();

    res.status(201).json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, company, status } = req.body;

  try {
    let contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.name = name !== undefined ? name : contact.name;
    contact.email = email !== undefined ? email : contact.email;
    contact.phone = phone !== undefined ? phone : contact.phone;
    contact.company = company !== undefined ? company : contact.company;
    contact.status = status !== undefined ? status : contact.status;

    await contact.save();
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Clean up activities and deals associated with this contact
    await Activity.deleteMany({ contactId: req.params.id, userId: req.user.id });
    await Deal.deleteMany({ contactId: req.params.id, userId: req.user.id });

    // Delete contact
    await Contact.deleteOne({ _id: req.params.id, userId: req.user.id });

    res.json({ message: 'Contact removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addNote = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Note text is required' });
  }

  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.notes.push({ text });
    await contact.save();

    // Log activity
    const activity = new Activity({
      userId: req.user.id,
      type: 'note',
      description: `Added note: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      contactId: contact._id,
    });
    await activity.save();

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateReminder = async (req, res) => {
  const { message, date, done } = req.body;

  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (message !== undefined && date !== undefined) {
      contact.reminder = {
        message,
        date: new Date(date),
        done: done !== undefined ? done : false,
      };
    } else if (contact.reminder) {
      if (done !== undefined) {
        contact.reminder.done = done;
      }
    } else {
      return res.status(400).json({ message: 'Reminder message and date are required to create a new reminder' });
    }

    await contact.save();
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
