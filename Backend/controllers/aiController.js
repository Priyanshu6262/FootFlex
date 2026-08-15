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
- AI-powered RAG policy search & product recommendations
- Responsive design for all devices

### Ordering Process
1. Browse products → 2. Select size & color → 3. Add to cart → 4. Login/Register → 5. Choose delivery address → 6. Select payment → 7. Confirm order

### Payment Methods & Payment Policies
- Razorpay UPI (Google Pay, PhonePe, Paytm, BHIM)
- Credit/Debit Cards (Visa, Mastercard, RuPay, Maestro)
- Net Banking (50+ banks) & Digital Wallets
- Cash on Delivery (COD) with OTP verification
- 256-bit SSL encryption & PCI-DSS compliance
- Automated GST Tax Invoices available in My Orders

### Payment Pending & Failed Transactions
- If money is deducted but order status shows 'Pending' or 'Failed', Razorpay auto-reconciles within 2-4 hours.
- If failed, debited amount auto-reverses to bank/card within 3-5 business days.
- Support available at support@footflex.com with Bank UTR / UPI Reference ID.

### Delivery & Shipping Policy
- Standard Delivery: 5–7 business days
- Express Delivery: 2–3 business days (select metro cities)
- Free shipping on orders above ₹999; ₹49 shipping charge for orders below ₹999
- Real-time courier tracking via BlueDart, Delhivery, DTDC, XpressBees

### Returns & Exchanges Policy
- Return window: 7 days from delivery date
- Exchange window: 7 days for size/color replacement (1st exchange is 100% FREE)
- Conditions: Must be unworn, unused, with original box and tags attached
- Process: Go to My Orders → Select order → Request Return / Exchange → Doorstep pickup in 24-48 hours

### Refund & Payment Refund Policy
- Processing timeline: 5–7 business days after return quality inspection
- Prepaid orders: Direct refund to original payment source (UPI/Card/Bank)
- COD orders: Direct bank transfer via NEFT/IMPS (customers provide Bank Account / UPI ID during return)

### Order Cancellation
- Orders can be cancelled within 24 hours of placement prior to dispatch
- Go to My Orders → Select Order → Cancel Order
- Instant refund initiated for prepaid orders upon cancellation

### Service & Customer Support Policy
- Email: support@footflex.com (SLA: response within 24 business hours)
- 24/7 AI Chatbot assistance
- Live Support: Mon–Sat, 10:00 AM – 6:00 PM IST
- Grievance Redressal: grievance@footflex.com

### Terms & Conditions
- User Account Responsibility, Intellectual Property ownership by FootFlex, Pricing error order cancellation rights, Indian Legal Jurisdiction.

## Behavior Rules
1. Always be helpful, friendly, and professional
2. Give concise, accurate answers — use bullet points for clarity
3. Ground answers strictly in FootFlex policies and retrieved context
4. Never invent prices, stock levels, or order statuses
5. Use emojis naturally to keep the tone welcoming`;

const assistantService = require('../ai/assistant/assistantService');

// ─── FootFlex AI Chatbot Handler (RAG + MCP) ──────────────────────────────────
exports.chatWithGemini = async (req, res) => {
  try {
    const { message, history = [], userId = null } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const responseData = await assistantService.processUserMessage({
      message: message.trim(),
      history,
      userId
    });

    res.status(200).json(responseData);
  } catch (error) {
    const errMsg = error?.message || String(error);
    console.error('FootFlex AI Chat Error:', errMsg);
    res.status(500).json({ 
      error: `AI Assistant Error: ${errMsg}` 
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
