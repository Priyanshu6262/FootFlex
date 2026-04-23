const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.patch('/reset-password/:token', adminController.resetPassword);

module.exports = router;
