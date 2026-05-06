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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // ← was hardcoded
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests (disable in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
  });
}

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/translate', require('./routes/translateRoutes'));
app.use('/api/summarize', require('./routes/summarizeRoutes'));
app.use('/api/flashcards', require('./routes/flashcardRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'AI Toolkit Hub API is running',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server — port comes from .env; default matches backend .env (5001)
const PORT = process.env.PORT || 5001; // ← was accidentally 5000
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});