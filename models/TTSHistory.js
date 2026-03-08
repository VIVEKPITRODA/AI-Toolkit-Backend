const mongoose = require('mongoose');

const ttsHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    default: 'en-US'
  },
  voice: {
    type: String,
    default: 'default'
  },
  voiceGender: {
    type: String,
    enum: ['male', 'female', 'neutral'],
    default: 'neutral'
  },
  speed: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0
  },
  pitch: {
    type: Number,
    default: 1.0,
    min: 0.0,
    max: 2.0
  },
  audioFormat: {
    type: String,
    enum: ['mp3', 'wav', 'ogg'],
    default: 'mp3'
  },
  audioUrl: {
    type: String // If storing audio files
  },
  duration: {
    type: Number // Audio duration in seconds
  },
  title: {
    type: String,
    default: 'Untitled Audio'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

ttsHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TTSHistory', ttsHistorySchema);