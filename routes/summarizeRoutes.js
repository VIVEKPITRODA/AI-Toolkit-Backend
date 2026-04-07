const express = require('express');
const router = express.Router();
const { summarizeText } = require('../controllers/summarizeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, summarizeText);


module.exports = router;