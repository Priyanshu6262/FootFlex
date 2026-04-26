const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

// Multer Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res, next) => {
  console.log('POST /api/products - Body:', req.body);
  console.log('POST /api/products - File:', req.file ? req.file.originalname : 'No file');
  next();
}, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
