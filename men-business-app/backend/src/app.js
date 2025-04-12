const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Men\'s Business Collaboration API' });
});

// Import routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

module.exports = app;
