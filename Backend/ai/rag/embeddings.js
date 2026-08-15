const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Fallback deterministic feature hashing vectorizer for TF-IDF / semantic matching.
 * Produces a normalized 256-dimensional vector for cosine similarity vector search.
 */
function hashVectorize(text, dim = 256) {
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  
  // Word tokens
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % dim;
    vec[index] += 1;
  }

  // Character bigrams
  const clean = text.toLowerCase().replace(/\s+/g, ' ');
  for (let i = 0; i < clean.length - 1; i++) {
    const bigram = clean.slice(i, i + 2);
    let hash = 0;
    for (let j = 0; j < bigram.length; j++) {
      hash = (hash << 5) - hash + bigram.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % dim;
    vec[index] += 0.5;
  }

  // Vector normalization
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return vec;
}

/**
 * Generates a vector embedding for a given text input.
 * Tries Google Gemini API first; falls back seamlessly to deterministic feature hashing vectorizer.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return hashVectorize('empty');
  }

  const trimmed = text.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
      const result = await model.embedContent(trimmed);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    }
  } catch (err) {
    // API endpoint unavailable or restricted — fallback gracefully to feature vectorizer
  }

  return hashVectorize(trimmed);
}

/**
 * Computes cosine similarity between two numeric vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} Similarity score between -1 and 1
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  hashVectorize
};
