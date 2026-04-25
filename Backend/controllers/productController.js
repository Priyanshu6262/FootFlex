const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { name, gender, category, price, discount, coupon, inventory } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

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
