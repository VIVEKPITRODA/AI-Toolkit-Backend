const pdfParse = require('pdf-parse');
const axios = require('axios');
const Flashcard = require('../models/Flashcard');

// @desc    Generate flashcards from PDF
// @route   POST /api/flashcards/generate
// @access  Private
const generateFlashcards = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const pdfBuffer = req.file.buffer;

    // Extract text from PDF
    const data = await pdfParse(pdfBuffer);
    const text = data.text.substring(0, 2000); // Limit text length

    // Generate Q&A with Hugging Face
    const prompt = `Generate 10 question and answer pairs from this text. Format each as "Q: [question] A: [answer]":\n\n${text}`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/google/flan-t5-large',
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        }
      }
    );

    // Parse flashcards
    const flashcardsText = response.data[0].generated_text;
    const flashcards = parseFlashcards(flashcardsText);

    // Save to database
    const savedFlashcard = await Flashcard.create({
      userId: req.user._id,
      title: req.body.title || 'Untitled Flashcard Set',
      flashcards
    });

    res.status(201).json({
      success: true,
      data: savedFlashcard
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to parse flashcards
const parseFlashcards = (text) => {
  // Simple parsing - improve based on actual response
  const lines = text.split('\n');
  const flashcards = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Q:')) {
      flashcards.push({
        question: lines[i].replace('Q:', '').trim(),
        answer: lines[i + 1]?.replace('A:', '').trim() || 'No answer'
      });
    }
  }

  return flashcards.length > 0 ? flashcards : [
    { question: 'Sample Question', answer: 'Sample Answer' }
  ];
};

// @desc    Get all flashcards
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateFlashcards, getFlashcards };