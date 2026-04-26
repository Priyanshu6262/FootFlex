const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOffers,
  getAllOffersAdmin,
  createOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');

// Public routes (user-facing)
router.get('/', getOffers);

// Admin routes (protected)
router.get('/admin', protect, getAllOffersAdmin);
router.post('/', protect, createOffer);
router.put('/:id', protect, updateOffer);
router.delete('/:id', protect, deleteOffer);

module.exports = router;
