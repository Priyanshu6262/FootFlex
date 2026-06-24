const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Public chatbot route — no auth required (customer support)
router.post('/chat', aiController.chatWithGemini);

// Protect the AI route so only logged-in admins can use it
router.post('/generate', protect, aiController.generateProductContent);
router.post('/remove-bg', protect, upload.single('image'), aiController.removeBackground);

module.exports = router;
