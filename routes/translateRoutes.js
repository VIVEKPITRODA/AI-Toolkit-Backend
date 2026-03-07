const express = require('express');
const router = express.Router();
const { translateText, getHistory } = require('../controllers/translateController');
const { protect } = require('../middleware/auth');

router.post('/', protect, translateText);
router.get('/history', protect, getHistory);

module.exports = router;