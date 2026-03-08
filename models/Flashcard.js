const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Flashcard Set'
  },
  description: {
    type: String
  },
  sourceFileName: {
    type: String
  },
  flashcards: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    category: {
      type: String
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  tags: [{
    type: String
  }],
  subject: {
    type: String
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  studyStats: {
    totalReviews: {
      type: Number,
      default: 0
    },
    lastReviewed: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
flashcardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

flashcardSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);