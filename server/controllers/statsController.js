const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

// TODO: add Redis caching for /api/stats endpoint
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Run queries in parallel
    const [totalContacts, activeLeads, dealsWonCount, wonDeals, recentActivities] = await Promise.all([
      Contact.countDocuments({ userId }),
      Contact.countDocuments({ userId, status: 'lead' }),
      Deal.countDocuments({ userId, stage: 'won' }),
      Deal.find({ userId, stage: 'won' }, 'value'),
      Activity.find({ userId })
        .populate('contactId', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

    res.json({
      totalContacts,
      activeLeads,
      dealsWon: dealsWonCount,
      totalRevenue,
      recentActivities,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
