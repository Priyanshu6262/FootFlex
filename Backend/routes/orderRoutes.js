const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/admin', protect, orderController.getAllOrders);
router.get('/user/:userId', orderController.getUserOrders);
router.put('/:id/status', protect, orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.returnOrder);

module.exports = router;
