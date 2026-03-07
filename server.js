const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/translate', require('./routes/translateRoutes'));
app.use('/api/summarize', require('./routes/summarizeRoutes'));
app.use('/api/flashcards', require('./routes/flashcardRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Toolkit Hub API is running',
    version: '1.0.0'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});