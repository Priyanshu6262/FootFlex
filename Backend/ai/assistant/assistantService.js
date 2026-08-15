const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const ragService = require('../rag/ragService');
const mcpServer = require('../mcp/server');
const { FOOTFLEX_AI_SYSTEM_PROMPT } = require('./prompts');
const User = require('../../models/User');
const Order = require('../../models/Order');

class AssistantService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  getGenAI() {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }
    return new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Calls Gemini models with automatic rate-limit (429) fallback across candidate Flash models.
   */
  async callGeminiWithFallback(userPrompt, history = []) {
    const genAI = this.getGenAI();
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-lite-latest',
      'gemini-2.5-flash-lite'
    ];

    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: FOOTFLEX_AI_SYSTEM_PROMPT
        });

        const geminiHistory = history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(userPrompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
        if (err.status === 429 || (err.message && err.message.includes('429'))) {
          console.warn(`[Gemini Rate Limit] Model '${modelName}' hit rate limit. Trying next fallback model...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError;
  }

  /**
   * Process incoming user message using RAG context, MCP database tools, and Gemini orchestration.
   * @param {Object} params - { message, history, userId }
   */
  async processUserMessage(params = {}) {
    const { message, history = [], userId = null } = params;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message is required');
    }

    const trimmedMsg = message.trim();
    const lowerMsg = trimmedMsg.toLowerCase();

    let structuredResponse = {
      type: 'general_text',
      reply: '',
      products: [],
      orders: [],
      cartAction: null,
      policySnippet: null
    };

    let ragContextStr = '';
    let mcpToolResults = [];
    const userContext = { userId };

    // ── 1. Gather Personalization Context if Authenticated ───────────────────
    let personalizationInfo = '';
    if (userId) {
      try {
        const userDoc = await User.findOne({ firebaseUid: userId }).populate('wishlist').lean();
        const recentOrders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(3).lean();
        
        if (userDoc) {
          const wishlistNames = userDoc.wishlist ? userDoc.wishlist.map(p => p.name).join(', ') : 'None';
          const pastPurchases = recentOrders.flatMap(o => o.items.map(i => i.name)).slice(0, 5).join(', ');
          personalizationInfo = `\n\n[Authenticated User Context]\nName: ${userDoc.name || 'User'}\nEmail: ${userDoc.email || 'N/A'}\nWishlist Items: ${wishlistNames || 'None'}\nRecent Order History: ${pastPurchases || 'None'}`;
        }
      } catch (err) {
        console.warn('Error fetching personalization context:', err.message);
      }
    }

    // ── 2. Determine Action & MCP Tool / RAG Execution ─────────────────────

    // A. User Account Profile, Address, & Wishlist Intent
    if (lowerMsg.includes('my profile') || lowerMsg.includes('my account') || lowerMsg.includes('who am i')) {
      const profileRes = await mcpServer.executeTool('get_user_profile', {}, userContext);
      mcpToolResults.push(profileRes.result || { error: profileRes.error });
    }
    else if (lowerMsg.includes('my address') || lowerMsg.includes('saved address') || lowerMsg.includes('delivery address')) {
      const addrRes = await mcpServer.executeTool('get_user_addresses', {}, userContext);
      mcpToolResults.push(addrRes.result || { error: addrRes.error });
    }
    else if (lowerMsg.includes('my wishlist') || lowerMsg.includes('view wishlist') || lowerMsg.includes('show wishlist')) {
      const wishRes = await mcpServer.executeTool('get_user_wishlist', {}, userContext);
      mcpToolResults.push(wishRes.result || { error: wishRes.error });
    }

    // B. Order Cancellation Intent
    else if (lowerMsg.includes('cancel') && lowerMsg.includes('order')) {
      if (!userId) {
        structuredResponse.type = 'general_text';
        structuredResponse.reply = 'Please log in to your FootFlex account to cancel an order.';
        return structuredResponse;
      }

      const orderIdMatch = trimmedMsg.match(/order\s*#?\s*([a-f0-9]{24})/i);
      const orderId = orderIdMatch ? orderIdMatch[1] : null;

      const cancelRes = await mcpServer.executeTool('cancel_user_order', { orderId }, userContext);
      mcpToolResults.push(cancelRes.result || { error: cancelRes.error });
    }

    // C. Cart Operation Intent (Add / Remove / Show Cart)
    else if (lowerMsg.includes('add') && (lowerMsg.includes('cart') || lowerMsg.includes('buy'))) {
      const cleanSearch = trimmedMsg
        .replace(/add/i, '')
        .replace(/to my cart/i, '')
        .replace(/to cart/i, '')
        .replace(/my cart/i, '')
        .replace(/this shoe/i, '')
        .trim();

      const searchRes = await mcpServer.executeTool('search_products', { query: cleanSearch || 'shoe', limit: 1 }, userContext);
      
      if (searchRes.success && searchRes.result && searchRes.result.length > 0) {
        const targetProduct = searchRes.result[0];
        
        const sizeMatch = trimmedMsg.match(/size\s*(\d+)/i);
        const size = sizeMatch ? sizeMatch[1] : (targetProduct.inventory[0]?.size || '8');
        const color = targetProduct.inventory[0]?.color || 'Default';

        const addRes = await mcpServer.executeTool('add_to_cart', {
          userId,
          productId: targetProduct.id,
          productName: targetProduct.name,
          size,
          color,
          quantity: 1
        }, userContext);

        if (addRes.success && addRes.result.success) {
          structuredResponse.type = 'cart_action';
          structuredResponse.cartAction = addRes.result;
          mcpToolResults.push(addRes.result);
        } else {
          structuredResponse.type = 'general_text';
          mcpToolResults.push(addRes.result || { error: addRes.error });
        }
      }
    } 
    else if (lowerMsg.includes('remove') && lowerMsg.includes('cart')) {
      const cleanSearch = trimmedMsg
        .replace(/remove/i, '')
        .replace(/from my cart/i, '')
        .replace(/from cart/i, '')
        .trim();

      const removeRes = await mcpServer.executeTool('remove_from_cart', {
        userId,
        productName: cleanSearch
      }, userContext);

      structuredResponse.type = 'cart_action';
      structuredResponse.cartAction = removeRes.result;
      mcpToolResults.push(removeRes.result);
    }
    else if (lowerMsg.includes('show my cart') || lowerMsg.includes('view cart') || lowerMsg.includes('my cart')) {
      const cartRes = await mcpServer.executeTool('get_cart', { userId }, userContext);
      mcpToolResults.push(cartRes.result || { error: cartRes.error });
    }

    // D. Order Status / History Intent
    else if (lowerMsg.includes('order') || lowerMsg.includes('where is my') || lowerMsg.includes('track')) {
      if (!userId) {
        structuredResponse.type = 'general_text';
        structuredResponse.reply = 'Please log in to your FootFlex account to view or track your orders.';
        return structuredResponse;
      }

      let dateFilter = null;
      if (lowerMsg.includes('today') || lowerMsg.includes("today's") || lowerMsg.includes("todays")) {
        dateFilter = 'today';
      } else if (lowerMsg.includes('yesterday') || lowerMsg.includes("yesterday's") || lowerMsg.includes("yesterdays")) {
        dateFilter = 'yesterday';
      } else if (lowerMsg.includes('this week') || lowerMsg.includes('last 7 days')) {
        dateFilter = 'this_week';
      } else if (lowerMsg.includes('this month') || lowerMsg.includes('last 30 days')) {
        dateFilter = 'this_month';
      }

      const ordersRes = await mcpServer.executeTool('get_user_orders', { userId, dateFilter, limit: 10 }, userContext);
      
      if (ordersRes.success && ordersRes.result) {
        const orderList = ordersRes.result.orders || ordersRes.result;
        structuredResponse.type = 'order_information';
        structuredResponse.orders = orderList;
        mcpToolResults.push({
          userOrdersCount: Array.isArray(orderList) ? orderList.length : 0,
          dateFilterApplied: dateFilter || 'all_time',
          queryMessage: ordersRes.result.message || null,
          recentOrders: orderList
        });
      }
    }

    // E. Product Search & Recommendation Intent
    else if (
      lowerMsg.includes('show') || 
      lowerMsg.includes('find') || 
      lowerMsg.includes('recommend') || 
      lowerMsg.includes('shoes under') || 
      lowerMsg.includes('sneakers') || 
      lowerMsg.includes('running') || 
      lowerMsg.includes('looking for')
    ) {
      const priceMatch = trimmedMsg.match(/(?:under|below|max|budget)\s*₹?\s*(\d+)/i);
      const maxPrice = priceMatch ? Number(priceMatch[1]) : undefined;

      let gender;
      if (lowerMsg.includes('men')) gender = 'Men';
      else if (lowerMsg.includes('women')) gender = 'Women';
      else if (lowerMsg.includes('kid')) gender = 'Kids';

      let category;
      if (lowerMsg.includes('running')) category = 'Running';
      else if (lowerMsg.includes('sneaker')) category = 'Sneakers';
      else if (lowerMsg.includes('formal')) category = 'Formal';
      else if (lowerMsg.includes('boot')) category = 'Boots';
      else if (lowerMsg.includes('sandal')) category = 'Sandals';

      const searchRes = await mcpServer.executeTool('search_products', {
        query: trimmedMsg,
        maxPrice,
        gender,
        category,
        limit: 5
      }, userContext);

      if (searchRes.success && searchRes.result && searchRes.result.length > 0) {
        structuredResponse.type = 'product_recommendation';
        structuredResponse.products = searchRes.result;
        mcpToolResults.push({ matchedProducts: searchRes.result });
      } else {
        const ragProducts = await ragService.searchProducts(trimmedMsg);
        if (ragProducts.hasContext) {
          ragContextStr += '\n\n' + ragProducts.formattedContext;
        }
      }
    }

    // F. Policy / FAQ / Customer Support / Terms Intent (RAG Retrieval)
    const isPolicyQuery = 
      lowerMsg.includes('policy') || 
      lowerMsg.includes('return') || 
      lowerMsg.includes('refund') || 
      lowerMsg.includes('shipping') || 
      lowerMsg.includes('delivery') || 
      lowerMsg.includes('exchange') || 
      lowerMsg.includes('warranty') || 
      lowerMsg.includes('payment') || 
      lowerMsg.includes('faq') || 
      lowerMsg.includes('material') || 
      lowerMsg.includes('size') ||
      lowerMsg.includes('pending') ||
      lowerMsg.includes('stuck') ||
      lowerMsg.includes('failed') ||
      lowerMsg.includes('support') ||
      lowerMsg.includes('contact') ||
      lowerMsg.includes('customer') ||
      lowerMsg.includes('service') ||
      lowerMsg.includes('help') ||
      lowerMsg.includes('terms') ||
      lowerMsg.includes('condition') ||
      lowerMsg.includes('legal') ||
      lowerMsg.includes('cod') ||
      lowerMsg.includes('razorpay') ||
      lowerMsg.includes('upi') ||
      lowerMsg.includes('bank') ||
      lowerMsg.includes('delay') ||
      lowerMsg.includes('damaged') ||
      lowerMsg.includes('defect') ||
      lowerMsg.includes('grievance');

    if (isPolicyQuery || (!ragContextStr && mcpToolResults.length === 0)) {
      const ragPolicyRes = await ragService.searchPolicies(trimmedMsg);
      if (ragPolicyRes.hasContext) {
        ragContextStr += '\n\n[Retrieved Policy & FAQ Knowledge]\n' + ragPolicyRes.formattedContext;
      }
    }

    // ── 3. LLM Call via Gemini with Candidate Fallback ─────────────────────
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const currentTimeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const userPrompt = `[Current System Date & Time]: ${currentDateStr} at ${currentTimeStr}
User Query: "${trimmedMsg}"${personalizationInfo}

${ragContextStr ? ragContextStr : ''}

${mcpToolResults.length > 0 ? `[Real-Time Database & MCP Execution Results]\n${JSON.stringify(mcpToolResults, null, 2)}` : ''}

Please provide a friendly, grounded, and concise response to the user based on the retrieved knowledge and real-time database results above.
If the user specifically asks for today's orders (or a specific date) and the database results show 0 orders were placed for that period, explicitly inform the user that no orders were placed today (or on that date) instead of displaying orders from previous days.`;

    const reply = await this.callGeminiWithFallback(userPrompt, history);
    structuredResponse.reply = reply;

    return structuredResponse;
  }
}

module.exports = new AssistantService();
