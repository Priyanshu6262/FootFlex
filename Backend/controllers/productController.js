const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { name, details, specifications, gender, category, price, discount, coupon, sizes, colors } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const newProduct = new Product({
      name,
      details,
      specifications,
      gender,
      category,
      price: Number(price),
      discount: Number(discount),
      coupon,
      imageUrl,
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors)
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product saved successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save product' });
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
