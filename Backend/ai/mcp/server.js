const productTools = require('./tools/productTools');
const cartTools = require('./tools/cartTools');
const orderTools = require('./tools/orderTools');
const userTools = require('./tools/userTools');

/**
 * FootFlex Model Context Protocol (MCP) Server
 * Central tool registry providing real-time data access and transactional actions for FootFlex AI.
 * Grants database permissions with strict per-user authentication and data isolation.
 */
class FootFlexMCPServer {
  constructor() {
    this.tools = {
      // ── Public Catalog & Inventory Tools ─────────────────────────────────
      search_products: {
        description: 'Search FootFlex live product catalog with filters for price, category, gender, color, and size.',
        requiresAuth: false,
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search keywords like running shoes, white sneakers' },
            minPrice: { type: 'number', description: 'Minimum price filter in INR' },
            maxPrice: { type: 'number', description: 'Maximum price filter in INR' },
            category: { type: 'string', description: 'Category e.g. Running, Sneakers, Formal, Boots, Sandals' },
            gender: { type: 'string', description: 'Gender e.g. Men, Women, Kids' },
            color: { type: 'string', description: 'Color filter e.g. Black, White, Red' },
            size: { type: 'string', description: 'Size filter e.g. 7, 8, 9, 10' }
          }
        },
        handler: productTools.searchProducts
      },
      get_product_details: {
        description: 'Get full product details including complete inventory stock for all size and color variants.',
        requiresAuth: false,
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'MongoDB Product ID' },
            productName: { type: 'string', description: 'Product name' }
          }
        },
        handler: productTools.getProductDetails
      },
      check_product_stock: {
        description: 'Check real-time stock availability for a specific shoe size and color variant.',
        requiresAuth: false,
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'MongoDB Product ID' },
            productName: { type: 'string', description: 'Product name' },
            size: { type: 'string', description: 'Shoe size e.g. 8' },
            color: { type: 'string', description: 'Shoe color e.g. Black' }
          }
        },
        handler: productTools.checkProductStock
      },

      // ── Authenticated User Specific Tools (Strictly Scoped by userId) ─────
      get_user_profile: {
        description: 'Fetch real-time profile details for the currently logged-in user.',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' }
          }
        },
        handler: userTools.getUserProfile
      },
      get_user_addresses: {
        description: 'Fetch saved delivery addresses strictly belonging to the logged-in user.',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' }
          }
        },
        handler: userTools.getUserAddresses
      },
      get_user_wishlist: {
        description: 'Fetch saved wishlist products strictly belonging to the logged-in user.',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' }
          }
        },
        handler: userTools.getUserWishlist
      },
      get_user_orders: {
        description: 'Fetch real-time order history strictly for the logged-in user with optional date filtering ("today", "yesterday", "this_week", "this_month", or "YYYY-MM-DD").',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' },
            dateFilter: { type: 'string', description: 'Filter orders by date e.g. "today", "yesterday", "this_week", "this_month", or "YYYY-MM-DD"' },
            startDate: { type: 'string', description: 'ISO start date' },
            endDate: { type: 'string', description: 'ISO end date' },
            limit: { type: 'number', description: 'Number of orders to fetch' }
          }
        },
        handler: orderTools.getUserOrders
      },
      get_order_status: {
        description: 'Fetch detailed real-time tracking status for a specific order or latest order matching date criteria (e.g. "today").',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' },
            orderId: { type: 'string', description: 'Order ID' },
            dateFilter: { type: 'string', description: 'Date filter e.g. "today"' }
          }
        },
        handler: orderTools.getOrderStatus
      },
      cancel_user_order: {
        description: 'Cancel a pending or processing order belonging strictly to the logged-in user.',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' },
            orderId: { type: 'string', description: 'Order ID' }
          }
        },
        handler: userTools.cancelUserOrder
      },
      get_cart: {
        description: 'Get current shopping cart details for the logged-in user.',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' }
          }
        },
        handler: cartTools.getCart
      },
      add_to_cart: {
        description: 'Verify product inventory stock and add item to logged-in user cart.',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' },
            productId: { type: 'string', description: 'MongoDB Product ID' },
            productName: { type: 'string', description: 'Product name' },
            size: { type: 'string', description: 'Shoe size e.g. 8' },
            color: { type: 'string', description: 'Shoe color e.g. Black' },
            quantity: { type: 'number', description: 'Quantity to add' }
          }
        },
        handler: cartTools.addToCart
      },
      remove_from_cart: {
        description: 'Remove item from logged-in user cart.',
        requiresAuth: true,
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Authenticated user Firebase UID' },
            cartItemId: { type: 'string', description: 'Cart item unique ID' },
            productName: { type: 'string', description: 'Name of product being removed' }
          }
        },
        handler: cartTools.removeFromCart
      }
    };
  }

  /**
   * Returns metadata list of available tools for LLM tool declaration.
   */
  getToolDeclarations() {
    return Object.keys(this.tools).map(name => ({
      name,
      description: this.tools[name].description,
      parameters: this.tools[name].parameters,
      requiresAuth: this.tools[name].requiresAuth
    }));
  }

  /**
   * Executes an MCP tool securely with strict database permissions and per-user data isolation.
   * @param {string} toolName 
   * @param {Object} args 
   * @param {Object} userContext - { userId: string }
   */
  async executeTool(toolName, args = {}, userContext = {}) {
    const tool = this.tools[toolName];
    if (!tool) {
      throw new Error(`MCP Tool '${toolName}' is not registered on FootFlex MCP Server.`);
    }

    // Security & Authorization Check: Block user-specific tools if not logged in
    if (tool.requiresAuth && (!userContext || !userContext.userId)) {
      console.warn(`[MCP Security Violation] Unauthenticated attempt to execute user tool '${toolName}'. Access denied.`);
      return {
        success: false,
        tool: toolName,
        error: 'Authentication required. Please log in to your FootFlex account to perform actions or access your data.'
      };
    }

    // Enforce strict user context: Override args.userId with session's authenticated userId
    const enforcedArgs = { ...args };
    if (userContext && userContext.userId) {
      enforcedArgs.userId = userContext.userId;
    }

    try {
      console.log(`[MCP Server DB] Executing tool '${toolName}' for User '${enforcedArgs.userId || 'Guest'}' with args:`, JSON.stringify(enforcedArgs));
      const result = await tool.handler(enforcedArgs);
      return { success: true, tool: toolName, result };
    } catch (error) {
      console.error(`[MCP Server Error] Tool execution failed (${toolName}):`, error.message);
      return { success: false, tool: toolName, error: error.message };
    }
  }
}

module.exports = new FootFlexMCPServer();
