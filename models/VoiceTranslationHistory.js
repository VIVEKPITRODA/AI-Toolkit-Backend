const mongoose = require('mongoose');

const voiceTranslationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  spokenText: {
    type: String,
    required: true
  },
  translatedText: {
    type: String,
    required: true
  },
  sourceLang: {
    type: String,
    required: true
  },
  targetLang: {
    type: String,
    required: true
  },
  audioPlayed: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String // For grouping conversations
  },
  duration: {
    type: Number // Duration in seconds
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

voiceTranslationHistorySchema.index({ userId: 1, createdAt: -1 });
voiceTranslationHistorySchema.index({ userId: 1, sessionId: 1 });

module.exports = mongoose.model('VoiceTranslationHistory', voiceTranslationHistorySchema);