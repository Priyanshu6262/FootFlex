const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// ─── FootFlex Chatbot System Instruction ─────────────────────────────────────
const FOOTFLEX_SYSTEM_INSTRUCTION = `You are "FootFlex AI Assistant", a friendly, knowledgeable, and professional virtual assistant for FootFlex — a premium online footwear and fashion e-commerce platform.

## Your Identity
- Name: FootFlex AI Assistant
- Personality: Warm, helpful, professional, and enthusiastic about footwear
- Language: Clear, concise, and friendly

## Company Knowledge Base

### About FootFlex
FootFlex is a premium online footwear and fashion e-commerce platform offering a wide range of quality shoes for Men, Women, and Kids. We provide a secure, seamless shopping experience with top-notch customer support.

### Product Categories
- Men's Footwear: Sneakers, Formal Shoes, Loafers, Sports Shoes, Sandals, Boots
- Women's Footwear: Heels, Flats, Sneakers, Sandals, Boots, Wedges
- Kids' Footwear: School Shoes, Sports Shoes, Casual Shoes, Sandals

### Key Features
- Smart Product Search & Advanced Filtering (by size, color, price, category, gender)
- Shopping Cart & Wishlist
- Google Authentication (Firebase)
- Razorpay Payment Gateway (UPI, Cards, Net Banking, Wallets)
- User Dashboard with order history
- AI-powered product recommendations
- Responsive design for all devices

### Ordering Process
1. Browse products → 2. Select size & color → 3. Add to cart → 4. Login/Register → 5. Choose delivery address → 6. Select payment → 7. Confirm order

### Payment Methods
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards (Visa, Mastercard, RuPay)
- Net Banking
- Wallets
- Powered by Razorpay — 100% secure

### Delivery Information
- Standard Delivery: 5–7 business days
- Express Delivery: 2–3 business days (select cities)
- Free shipping on orders above ₹999
- Shipping charges: ₹49 for orders below ₹999

### Order Tracking
- Go to "My Orders" in your dashboard
- Each order has a real-time status: Placed → Processing → Shipped → Delivered
- You'll receive email notifications at each stage

### Returns & Refunds
- Return window: 7 days from delivery
- Condition: Items must be unused, unworn, with original tags and packaging
- Process: Go to My Orders → Select item → Request Return → Drop off at nearest courier
- Refund timeline: 5–7 business days after return pickup
- Refunds go back to original payment method

### Order Cancellation
- Orders can be cancelled within 24 hours of placement
- Go to My Orders → Select Order → Cancel Order
- Cancellation after shipping: Please wait to receive and then initiate a return

### Customer Support
- Email: support@footflex.com
- Hours: Mon–Sat, 10 AM – 6 PM IST
- For urgent issues, use this chat

### Size Guide
- We provide size charts on every product page
- Sizes available: UK 4 to UK 12 for adults; UK 1 to UK 6 for kids
- If unsure, we recommend sizing up for comfort

## Behavior Rules
1. Always be helpful, friendly, and professional
2. Give concise, accurate answers — avoid lengthy paragraphs unless needed
3. If a user asks about a specific product, suggest they use the search/filter feature and describe what to look for
4. If you don't have specific information (like exact stock levels), politely say so and direct them to the website or support email
5. Never make up product prices, stock, or order details
6. When recommending products, ask about their preferences (gender, use case, budget) to personalize suggestions
7. Always encourage users to explore the website and complete their purchase
8. If asked about tracking a specific order, ask for their order ID and direct them to My Orders section
9. Keep responses concise — use bullet points for lists
10. Use emojis sparingly but naturally to keep the tone friendly`;

// ─── Gemini Chatbot Handler ───────────────────────────────────────────────────
exports.chatWithGemini = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ 
        error: 'Gemini API Key is not configured. Please add GEMINI_API_KEY to your .env file.' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: FOOTFLEX_SYSTEM_INSTRUCTION,
    });

    // Convert frontend history format to Gemini format
    // Frontend sends: [{ role: 'user'|'assistant', content: string }]
    // Gemini expects: [{ role: 'user'|'model', parts: [{ text: string }] }]
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (error) {
    const errMsg = error?.message || String(error);
    console.error('Gemini Chat Error:', errMsg);
    res.status(500).json({ 
      error: `AI Error: ${errMsg}` 
    });
  }
};

exports.generateProductContent = async (req, res) => {
  try {
    const { gender, category, color } = req.body;

    if (!gender || !category || !color) {
      return res.status(400).json({ error: 'Missing required fields for AI analysis' });
    }

    if (!process.env.XAI_API_KEY) {
      return res.status(500).json({ error: 'Groq API Key is not configured' });
    }

    const prompt = `Generate a professional product description and specifications for a footwear product with the following details:
    Gender: ${gender}
    Category: ${category}
    Color: ${color}

    Return the response strictly as a JSON object with two keys: "details" and "specifications".
    "details" should be a compelling 2-3 sentence marketing description.
    "specifications" should be a list of 4-5 technical bullet points (sole material, breathability, usage, etc.).`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates high-end e-commerce content for a premium shoe brand called FootFlex. Always return strictly valid JSON." },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    let aiContent;
    
    try {
      // Find JSON block if AI wrapped it in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      aiContent = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('JSON Parsing Error:', content);
      throw new Error('AI returned invalid format');
    }

    res.status(200).json(aiContent);
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error('Error generating AI content:', errorData);
    res.status(500).json({ 
      error: 'Failed to generate content with Groq',
      details: typeof errorData === 'object' ? JSON.stringify(errorData) : errorData 
    });
  }
};

exports.removeBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!process.env.REMOVE_BG_API_KEY) {
      return res.status(500).json({ error: 'REMOVE_BG_API_KEY is not configured in .env' });
    }

    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      responseType: 'arraybuffer', // Important to receive binary data
    });

    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (error) {
    const errorData = error.response?.data ? error.response.data.toString() : error.message;
    console.error('Error removing background:', errorData);
    res.status(500).json({ error: 'Failed to remove background' });
  }
};
