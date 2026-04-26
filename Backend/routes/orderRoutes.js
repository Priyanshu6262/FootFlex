const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/admin', protect, orderController.getAllOrders);
router.put('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router;
