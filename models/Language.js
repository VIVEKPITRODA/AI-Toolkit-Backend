const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  nativeName: {
    type: String
  },
  supportedFeatures: {
    textTranslation: {
      type: Boolean,
      default: true
    },
    voiceTranslation: {
      type: Boolean,
      default: false
    },
    textToSpeech: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Language', languageSchema);