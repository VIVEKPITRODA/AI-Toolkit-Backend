const express = require('express');
const router = express.Router();
const { summarizeText, getHistory } = require('../controllers/summarizeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, summarizeText);
router.get('/history', protect, getHistory);  // ← added

module.exports = router;