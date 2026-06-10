require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const dealRoutes = require('./routes/deals');
const activityRoutes = require('./routes/activities');
const statsRoutes = require('./routes/stats');

const app = express();

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yourcrm';
mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stats', statsRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('YOURCRM API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
