const Product = require('../models/Product');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

const MAX_SIZE = 250 * 1024; // 250KB

async function optimizeAndSaveImage(buffer, originalName) {
  const filename = `${Date.now()}-${path.parse(originalName).name.replace(/[^a-zA-Z0-9]/g, '')}.webp`;
  const outputPath = path.join(uploadsDir, filename);

  let minQ = 1;
  let maxQ = 100;
  let bestBuffer = null;

  // First, check if max quality is already under 250KB
  let maxQualityBuffer = await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 100 })
    .toBuffer();

  if (maxQualityBuffer.length <= MAX_SIZE) {
    await fs.writeFile(outputPath, maxQualityBuffer);
    return `/uploads/${filename}`;
  }

  // Binary search for highest quality under 250KB
  for (let i = 0; i < 7; i++) {
    let quality = Math.floor((minQ + maxQ) / 2);
    let optimizedBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    if (optimizedBuffer.length <= MAX_SIZE) {
      bestBuffer = optimizedBuffer;
      minQ = quality + 1; // Try to get higher quality
    } else {
      maxQ = quality - 1; // Need lower size
    }
    
    if (minQ > maxQ) break;
  }

  if (!bestBuffer) {
    bestBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 10 })
      .toBuffer();
  }

  await fs.writeFile(outputPath, bestBuffer);
  return `/uploads/${filename}`;
}

exports.createProduct = async (req, res) => {
  try {
    const { name, gender, category, price, discount, coupon, inventory } = req.body;
    let imageUrl = req.body.imageUrl;
    
    if (req.file) {
      imageUrl = await optimizeAndSaveImage(req.file.buffer, req.file.originalname);
    }

    let parsedInventory = [];
    if (typeof inventory === 'string') {
      parsedInventory = JSON.parse(inventory);
    } else if (Array.isArray(inventory)) {
      parsedInventory = inventory;
    }

    const totalQuantity = parsedInventory.reduce((sum, item) => sum + Number(item.quantity), 0);

    const newProduct = new Product({
      name,
      gender,
      category,
      price: Number(price),
      discount: Number(discount),
      coupon,
      imageUrl,
      inventory: parsedInventory,
      totalQuantity
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product saved successfully', product: newProduct });
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ 
      error: 'Failed to save product', 
      message: error.message,
      stack: error.stack,
      validationErrors: error.errors 
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, category, price, discount, coupon, inventory } = req.body;
    
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let imageUrl = product.imageUrl;
    if (req.file) {
      imageUrl = await optimizeAndSaveImage(req.file.buffer, req.file.originalname);
    }

    let parsedInventory = product.inventory;
    if (inventory) {
      if (typeof inventory === 'string') {
        parsedInventory = JSON.parse(inventory);
      } else if (Array.isArray(inventory)) {
        parsedInventory = inventory;
      }
    }

    const totalQuantity = parsedInventory.reduce((sum, item) => sum + Number(item.quantity), 0);

    product.name = name || product.name;
    product.gender = gender || product.gender;
    product.category = category || product.category;
    if (price !== undefined) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (coupon !== undefined) product.coupon = coupon;
    product.imageUrl = imageUrl;
    product.inventory = parsedInventory;
    product.totalQuantity = totalQuantity;

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ 
      error: 'Failed to update product', 
      message: error.message 
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Note: To be safe, we are not deleting the image file from the disk right now.
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
};
