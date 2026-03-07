const axios = require('axios');
const TranslationHistory = require('../models/TranslationHistory');

// @desc    Translate text
// @route   POST /api/translate
// @access  Private
const translateText = async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    // Validation
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Call MyMemory Translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await axios.get(url);
    const translatedText = response.data.responseData.translatedText;

    // Save to history
    const history = await TranslationHistory.create({
      userId: req.user._id,
      sourceText: text,
      translatedText,
      sourceLang,
      targetLang
    });

    res.status(200).json({
      success: true,
      translatedText,
      history: history._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get translation history
// @route   GET /api/translate/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const history = await TranslationHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { translateText, getHistory };