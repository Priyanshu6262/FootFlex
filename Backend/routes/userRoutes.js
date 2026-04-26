const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/sync', userController.syncUser);
router.get('/status/:uid', userController.checkStatus);

module.exports = router;
