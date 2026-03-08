const mongoose = require('mongoose');

const summaryHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalText: {
    type: String,
    required: true
  },
  summaryText: {
    type: String,
    required: true
  },
  summaryLength: {
    type: String,
    enum: ['short', 'medium', 'detailed'],
    default: 'medium'
  },
  outputFormat: {
    type: String,
    enum: ['bullets', 'paragraph'],
    default: 'paragraph'
  },
  keySentences: [{
    type: String
  }],
  title: {
    type: String,
    default: 'Untitled Summary'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  wordCount: {
    original: Number,
    summary: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

summaryHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SummaryHistory', summaryHistorySchema);