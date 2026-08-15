const Knowledge = require('../../models/Knowledge');
const { generateEmbedding, cosineSimilarity } = require('./embeddings');

/**
 * Searches the Knowledge vector database for relevant product or policy chunks.
 * @param {string} query - Natural language search query
 * @param {Object} options - Search configuration (topK, docType, minScore)
 * @returns {Promise<Array<{ doc: Object, score: number }>>}
 */
async function searchVectorStore(query, options = {}) {
  const { topK = 5, docType = null, minScore = 0.35 } = options;

  if (!query || typeof query !== 'string') return [];

  // Generate vector embedding for user query
  const queryEmbedding = await generateEmbedding(query);

  const filter = {};
  if (docType) {
    filter.docType = docType;
  }

  // Retrieve indexed documents from Knowledge collection
  const documents = await Knowledge.find(filter).lean();

  if (!documents || documents.length === 0) {
    return [];
  }

  // Compute cosine similarity score for each knowledge document
  const scoredDocs = documents.map(doc => {
    const score = cosineSimilarity(queryEmbedding, doc.embedding);
    return { doc, score };
  });

  // Sort by similarity score descending and pick topK
  const results = scoredDocs
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}

module.exports = {
  searchVectorStore,
};
