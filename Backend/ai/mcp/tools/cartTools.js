const Product = require('../../../models/Product');

/**
 * MCP Tool: add_to_cart
 * Validates product existence, size/color variant stock, and returns a verified cart addition payload.
 */
async function addToCart(params = {}) {
  const { userId, productId, productName, size, color, quantity = 1 } = params;

  if (!userId) {
    throw new Error('User authentication is required to manage cart.');
  }

  let product = null;
  if (productId) {
    product = await Product.findById(productId);
  } else if (productName) {
    product = await Product.findOne({ name: new RegExp(productName.trim(), 'i') });
  }

  if (!product) {
    return {
      success: false,
      error: `Could not find product ${productName || productId || ''} in FootFlex catalog.`
    };
  }

  // Check inventory for specified size & color
  let selectedSize = size;
  let selectedColor = color;

  if (product.inventory && product.inventory.length > 0) {
    let matchingVariant = product.inventory.find(inv => {
      const matchSize = !size || String(inv.size) === String(size);
      const matchColor = !color || inv.color.toLowerCase() === color.toLowerCase();
      return matchSize && matchColor;
    });

    if (!matchingVariant) {
      // Pick first available in-stock variant if not specifically matched
      matchingVariant = product.inventory.find(inv => inv.quantity > 0) || product.inventory[0];
    }

    selectedSize = selectedSize || matchingVariant.size;
    selectedColor = selectedColor || matchingVariant.color;

    if (matchingVariant.quantity < quantity) {
      return {
        success: false,
        error: `Insufficient stock for ${product.name} (Size: ${selectedSize}, Color: ${selectedColor}). Requested: ${quantity}, Available: ${matchingVariant.quantity}`
      };
    }
  }

  const cartItemId = `${product._id}-${selectedSize || 'any'}-${selectedColor ? selectedColor.replace('#', '') : 'any'}`;

  return {
    success: true,
    action: 'add',
    cartItem: {
      id: String(product._id),
      cartItemId,
      name: product.name,
      price: product.price,
      discount: product.discount || 0,
      imageUrl: product.imageUrl,
      size: selectedSize,
      color: selectedColor,
      quantity
    },
    message: `Successfully added ${quantity}x ${product.name} (Size ${selectedSize}, ${selectedColor}) to your cart!`
  };
}

/**
 * MCP Tool: remove_from_cart
 * Prepares item removal command from user cart.
 */
async function removeFromCart(params = {}) {
  const { userId, cartItemId, productName } = params;

  if (!userId) {
    throw new Error('User authentication is required to manage cart.');
  }

  return {
    success: true,
    action: 'remove',
    cartItemId,
    productName,
    message: `Removed ${productName || 'item'} from your cart.`
  };
}

/**
 * MCP Tool: get_cart
 * Fetches cart status prompt or items summary.
 */
async function getCart(params = {}) {
  const { userId, cartItems = [] } = params;

  if (!userId) {
    throw new Error('User authentication is required to view cart.');
  }

  return {
    userId,
    itemCount: cartItems.length,
    items: cartItems,
    message: cartItems.length > 0
      ? `You currently have ${cartItems.length} item(s) in your cart.`
      : 'Your shopping cart is currently empty.'
  };
}

module.exports = {
  addToCart,
  removeFromCart,
  getCart
};
