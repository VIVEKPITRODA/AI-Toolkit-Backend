const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateFlashcards, getFlashcards } = require('../controllers/flashcardController');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/generate', protect, upload.single('pdf'), generateFlashcards);
router.get('/', protect, getFlashcards);

module.exports = router;