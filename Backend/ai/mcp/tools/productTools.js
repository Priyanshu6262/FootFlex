const Product = require('../../../models/Product');

/**
 * MCP Tool: search_products
 * Searches FootFlex live product catalog using filters and natural language criteria.
 */
async function searchProducts(params = {}) {
  const {
    query = '',
    minPrice,
    maxPrice,
    category,
    gender,
    color,
    size,
    limit = 6
  } = params;

  const mongoQuery = {};

  // Price range filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    mongoQuery.price = {};
    if (minPrice !== undefined && minPrice !== null) mongoQuery.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== null) mongoQuery.price.$lte = Number(maxPrice);
  }

  const conditions = [];

  // Natural language query cleaning
  if (query && query.trim() !== '') {
    const cleanTerm = query.trim()
      .replace(/show me/gi, '')
      .replace(/find/gi, '')
      .replace(/i need/gi, '')
      .replace(/looking for/gi, '')
      .replace(/shoes under \d+/gi, '')
      .replace(/sneakers under \d+/gi, '')
      .replace(/under ₹?\d+/gi, '')
      .replace(/below ₹?\d+/gi, '')
      .trim();

    if (cleanTerm) {
      const regex = new RegExp(cleanTerm, 'i');
      conditions.push({
        $or: [
          { name: regex },
          { category: regex },
          { gender: regex }
        ]
      });
    }
  }

  if (category && category.trim() !== '') {
    conditions.push({ category: new RegExp(category.trim(), 'i') });
  }

  if (gender && gender.trim() !== '') {
    conditions.push({ gender: new RegExp(gender.trim(), 'i') });
  }

  if (color && color.trim() !== '') {
    conditions.push({ 'inventory.color': new RegExp(color.trim(), 'i') });
  }

  if (size && String(size).trim() !== '') {
    conditions.push({ 'inventory.size': String(size).trim() });
  }

  if (conditions.length > 0) {
    mongoQuery.$and = conditions;
  }

  let products = await Product.find(mongoQuery)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Fallback: If strict filtered search yields 0 items, search all available products within budget
  if (products.length === 0) {
    const fallbackQuery = {};
    if (maxPrice !== undefined) fallbackQuery.price = { $lte: Number(maxPrice) };
    products = await Product.find(fallbackQuery).sort({ price: 1 }).limit(limit).lean();
  }

  return products.map(p => ({
    id: String(p._id),
    name: p.name,
    category: p.category,
    gender: p.gender,
    price: p.price,
    discount: p.discount || 0,
    imageUrl: p.imageUrl,
    totalQuantity: p.totalQuantity,
    inventory: p.inventory,
    isAvailable: p.totalQuantity > 0
  }));
}

/**
 * MCP Tool: get_product_details
 * Retrieves complete real-time product profile and stock state.
 */
async function getProductDetails(params = {}) {
  const { productId, productName } = params;

  let product = null;
  if (productId) {
    product = await Product.findById(productId).lean();
  } else if (productName) {
    product = await Product.findOne({ name: new RegExp(productName.trim(), 'i') }).lean();
  }

  if (!product) {
    throw new Error(`Product not found with criteria: ${JSON.stringify(params)}`);
  }

  return {
    id: String(product._id),
    name: product.name,
    category: product.category,
    gender: product.gender,
    price: product.price,
    discount: product.discount || 0,
    coupon: product.coupon || null,
    imageUrl: product.imageUrl,
    inventory: product.inventory,
    totalQuantity: product.totalQuantity
  };
}

/**
 * MCP Tool: check_product_stock
 * Checks inventory for a given product, size, and color.
 */
async function checkProductStock(params = {}) {
  const { productId, productName, size, color } = params;

  let product = null;
  if (productId) {
    product = await Product.findById(productId);
  } else if (productName) {
    product = await Product.findOne({ name: new RegExp(productName.trim(), 'i') });
  }

  if (!product) {
    return { available: false, message: 'Product not found in FootFlex catalog.', stock: 0 };
  }

  if (!size && !color) {
    return {
      productId: String(product._id),
      productName: product.name,
      totalStock: product.totalQuantity,
      available: product.totalQuantity > 0,
      inventorySummary: product.inventory
    };
  }

  const variant = product.inventory.find(inv => {
    const sizeMatch = !size || String(inv.size) === String(size);
    const colorMatch = !color || inv.color.toLowerCase() === color.toLowerCase();
    return sizeMatch && colorMatch;
  });

  if (!variant) {
    return {
      productId: String(product._id),
      productName: product.name,
      available: false,
      stock: 0,
      message: `Variant with size ${size || 'any'} and color ${color || 'any'} is not available.`
    };
  }

  return {
    productId: String(product._id),
    productName: product.name,
    size: variant.size,
    color: variant.color,
    stock: variant.quantity,
    available: variant.quantity > 0,
    message: variant.quantity > 0 
      ? `In stock (${variant.quantity} units available)` 
      : 'Currently out of stock'
  };
}

module.exports = {
  searchProducts,
  getProductDetails,
  checkProductStock
};
