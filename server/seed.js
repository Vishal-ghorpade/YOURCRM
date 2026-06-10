require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Contact = require('./models/Contact');
const Deal = require('./models/Deal');
const Activity = require('./models/Activity');

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yourcrm';
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing existing database records...');
    await Promise.all([
      User.deleteMany({}),
      Contact.deleteMany({}),
      Deal.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log('Database cleared.');

    // Create seed User
    console.log('Creating test user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = new User({
      name: 'Vishal',
      email: 'vishal@yourcrm.com',
      password: hashedPassword,
    });
    await user.save();
    console.log(`User created: ${user.email} (password: password123)`);

    // Create Contacts
    console.log('Creating contacts...');
    const today = new Date();
    
    // Reminder dates
    const reminderDueToday = new Date(today);
    reminderDueToday.setHours(12, 0, 0, 0);

    const reminderOverdue = new Date(today);
    reminderOverdue.setDate(today.getDate() - 1);
    reminderOverdue.setHours(9, 0, 0, 0);

    const reminderFuture = new Date(today);
    reminderFuture.setDate(today.getDate() + 3);

    const contactsData = [
      {
        userId: user._id,
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.com',
        phone: '+1 555-0199',
        company: 'Cyberdyne Systems',
        status: 'lead',
        notes: [
          { text: 'Initial call completed. She was highly interested in our safety packages.' },
          { text: 'Sent proposal PDF via email. Waiting for response.' }
        ],
        reminder: {
          message: 'Follow up on proposal review',
          date: reminderDueToday,
          done: false
        }
      },
      {
        userId: user._id,
        name: 'Bruce Wayne',
        email: 'bruce@waynecorp.com',
        phone: '+1 555-1939',
        company: 'Wayne Enterprises',
        status: 'customer',
        notes: [
          { text: 'Contract signed for enterprise licensing.' },
          { text: 'Assigned account manager to setup workspace.' }
        ],
        reminder: {
          message: 'Q2 Business Review meeting',
          date: reminderFuture,
          done: false
        }
      },
      {
        userId: user._id,
        name: 'Tony Stark',
        email: 'tony@starkindustries.com',
        phone: '+1 555-1963',
        company: 'Stark Industries',
        status: 'customer',
        notes: [
          { text: 'Requested custom clean energy integrations.' }
        ]
      },
      {
        userId: user._id,
        name: 'Arthur Dent',
        email: 'arthur@guide.com',
        phone: '+44 123-4567',
        company: 'Megadodo Publications',
        status: 'churned',
        notes: [
          { text: 'Complained about documentation clarity. Decided to churn.' }
        ],
        reminder: {
          message: 'Send exit feedback questionnaire survey',
          date: reminderOverdue,
          done: false
        }
      },
      {
        userId: user._id,
        name: 'Peter Parker',
        email: 'peter@dailybugle.com',
        phone: '+1 555-0143',
        company: 'Daily Bugle',
        status: 'lead',
        notes: [
          { text: 'Expressed interest in camera equipment leases.' }
        ]
      }
    ];

    const seededContacts = await Contact.insertMany(contactsData);
    console.log(`${seededContacts.length} contacts created.`);

    // Find contacts for deal references
    const sarah = seededContacts.find(c => c.name === 'Sarah Connor');
    const bruce = seededContacts.find(c => c.name === 'Bruce Wayne');
    const tony = seededContacts.find(c => c.name === 'Tony Stark');
    const peter = seededContacts.find(c => c.name === 'Peter Parker');

    // Create Deals
    console.log('Creating deals...');
    const dealsData = [
      {
        userId: user._id,
        title: 'Cyberdyne Security Server Licensing',
        contactId: sarah._id,
        value: 12500,
        stage: 'qualified'
      },
      {
        userId: user._id,
        title: 'Wayne Enterprises HQ Implementation',
        contactId: bruce._id,
        value: 150000,
        stage: 'won'
      },
      {
        userId: user._id,
        title: 'Arc Reactor Clean Grid Software Integration',
        contactId: tony._id,
        value: 500000,
        stage: 'won'
      },
      {
        userId: user._id,
        title: 'Daily Bugle Media Kit Lease',
        contactId: peter._id,
        value: 3200,
        stage: 'new'
      },
      {
        userId: user._id,
        title: 'Stark Industries Repulsor Calibration Suite',
        contactId: tony._id,
        value: 85000,
        stage: 'contacted'
      }
    ];

    const seededDeals = await Deal.insertMany(dealsData);
    console.log(`${seededDeals.length} deals created.`);

    // Create Activities
    console.log('Creating activities...');
    const activitiesData = [
      {
        userId: user._id,
        type: 'call',
        description: 'Completed call with Sarah Connor discussing security server specs.',
        contactId: sarah._id,
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: user._id,
        type: 'meeting',
        description: 'Wayne Enterprises HQ Implementation deal closed won!',
        contactId: bruce._id,
        createdAt: new Date(today.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        userId: user._id,
        type: 'email',
        description: 'Sent custom licensing draft proposal to Tony Stark.',
        contactId: tony._id,
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: user._id,
        type: 'note',
        description: 'Added exit interview notes for Arthur Dent.',
        contactId: seededContacts.find(c => c.name === 'Arthur Dent')._id,
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: user._id,
        type: 'call',
        description: 'Introductory call with Peter Parker from Daily Bugle.',
        contactId: peter._id,
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ];

    const seededActivities = await Activity.insertMany(activitiesData);
    console.log(`${seededActivities.length} activities created.`);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

seedDatabase();
