const axios = require('axios');

// @desc    Summarize text
// @route   POST /api/summarize
// @access  Private
const summarizeText = async (req, res) => {
  try {
    const { text, length } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({ message: 'Please provide text to summarize' });
    }

    // Call Hugging Face API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data[0].summary_text;

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { summarizeText };