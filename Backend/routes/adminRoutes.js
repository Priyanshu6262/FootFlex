const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', adminController.login);
router.get('/stats', protect, adminController.getDashboardStats);

router.get('/users', protect, adminController.getAllUsers);
router.put('/users/:id/block', protect, adminController.toggleBlockUser);
router.get('/users/:id/orders', protect, adminController.getUserOrders);

module.exports = router;
