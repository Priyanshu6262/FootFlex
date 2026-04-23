const axios = require('axios');
require('dotenv').config();

exports.generateProductContent = async (req, res) => {
  try {
    const { gender, category, color } = req.body;

    if (!gender || !category || !color) {
      return res.status(400).json({ error: 'Missing required fields for AI analysis' });
    }

    if (!process.env.XAI_API_KEY) {
      return res.status(500).json({ error: 'xAI API Key is not configured' });
    }

    const prompt = `Generate a professional product description and specifications for a footwear product with the following details:
    Gender: ${gender}
    Category: ${category}
    Color: ${color}

    Return the response strictly as a JSON object with two keys: "details" and "specifications".
    "details" should be a compelling 2-3 sentence marketing description.
    "specifications" should be a list of 4-5 technical bullet points (sole material, breathability, usage, etc.).`;

    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      model: "grok-beta",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates high-end e-commerce content for a premium shoe brand called FootFlex." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiContent = JSON.parse(response.data.choices[0].message.content);
    res.status(200).json(aiContent);
  } catch (error) {
    console.error('Error generating AI content:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate content with AI' });
  }
};
