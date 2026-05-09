const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { name, gender, category, price, discount, coupon, inventory } = req.body;
    // Cloudinary URL is set in req.file.path by multer-storage-cloudinary
    let imageUrl = req.file ? req.file.path : req.body.imageUrl;

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
    const limit = parseInt(req.query.limit) || 15;
    const skip = parseInt(req.query.skip) || 0;
    
    const products = await Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalCount = await Product.countDocuments();
    const hasMore = totalCount > (skip + products.length);

    res.status(200).json({ products, totalCount, hasMore });
  } catch (error) {
    console.error('Fetch Products Error:', error);
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

    // Cloudinary URL is set in req.file.path by multer-storage-cloudinary
    let imageUrl = req.file ? req.file.path : product.imageUrl;

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
