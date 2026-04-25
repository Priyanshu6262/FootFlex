const axios = require('axios');
require('dotenv').config();

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
