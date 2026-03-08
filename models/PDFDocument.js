const mongoose = require('mongoose');

const pdfDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number // Size in bytes
  },
  filePath: {
    type: String,
    required: true
  },
  extractedText: {
    type: String
  },
  pageCount: {
    type: Number
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  flashcardSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard'
  },
  metadata: {
    title: String,
    author: String,
    subject: String,
    keywords: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

pdfDocumentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PDFDocument', pdfDocumentSchema);