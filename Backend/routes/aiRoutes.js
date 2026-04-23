const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protect the AI route so only logged-in admins can use it
router.post('/generate', protect, aiController.generateProductContent);

module.exports = router;
