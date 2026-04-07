const { CanvasFactory } = require('pdf-parse/worker');
const { PDFParse } = require('pdf-parse');
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

    // Extract text from PDF using pdf-parse v2 API
    const parser = new PDFParse({ data: pdfBuffer, CanvasFactory });
    const data = await parser.getText();
    const text = (data.text || '').substring(0, 2000);

    if (!text.trim()) {
      return res.status(400).json({ message: 'Could not extract text from PDF' });
    }

    const prompt = `Generate 10 question and answer pairs from this text.
Format each as:
Q: [question]
A: [answer]

${text}`;

 const response = await axios.post(
  'https://router.huggingface.co/v1/chat/completions',
  {
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    messages: [
      {
        role: 'user',
        content: `Generate 10 flashcards (Q&A) from this text:\n\n${text}`
      }
    ]
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    }
  }
);

const flashcardsText = response.data.choices[0].message.content;

    const flashcards = parseFlashcards(flashcardsText);

    const savedFlashcard = await Flashcard.create({
      userId: req.user._id,
      title: req.body.title || 'Untitled Flashcard Set',
      flashcards,
    });

    res.status(201).json({
      success: true,
      data: savedFlashcard,
    });
  } catch (error) {
    console.error('Flashcard generation error:', error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.error || error.message || 'Server error',
    });
  }
};

const parseFlashcards = (text) => {
  const lines = text.split('\n');
  const flashcards = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('Q:')) {
      flashcards.push({
        question: lines[i].replace(/^Q:\s*/, '').trim(),
        answer: lines[i + 1]?.replace(/^A:\s*/, '').trim() || 'No answer',
      });
    }
  }

  return flashcards.length > 0
    ? flashcards
    : [{ question: 'Sample Question', answer: 'Sample Answer' }];
};

// @desc    Get all flashcards
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateFlashcards, getFlashcards };