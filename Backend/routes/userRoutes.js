const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/sync', userController.syncUser);
router.get('/status/:uid', userController.checkStatus);

// Wishlist Routes
router.get('/:uid/wishlist', userController.getWishlist);
router.post('/:uid/wishlist/add', userController.addToWishlist);
router.delete('/:uid/wishlist/remove/:productId', userController.removeFromWishlist);

module.exports = router;
