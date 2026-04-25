const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res, next) => {
  console.log('POST /api/products - Body:', req.body);
  console.log('POST /api/products - File:', req.file);
  next();
}, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
