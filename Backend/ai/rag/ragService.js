const { searchVectorStore } = require('./retrieval');

class RAGService {
  /**
   * High-level search returning grounding context for LLM prompt enhancement.
   * @param {string} query 
   * @param {Object} options 
   */
  async retrieveContext(query, options = {}) {
    try {
      const results = await searchVectorStore(query, options);
      if (!results || results.length === 0) {
        return {
          hasContext: false,
          formattedContext: 'No specific background knowledge documents match this query.',
          rawDocuments: []
        };
      }

      const formattedContext = results
        .map((res, idx) => `[Source ${idx + 1}: ${res.doc.title} (${res.doc.docType})]\n${res.doc.content}`)
        .join('\n\n---\n\n');

      return {
        hasContext: true,
        formattedContext,
        rawDocuments: results.map(r => r.doc)
      };
    } catch (error) {
      console.error('RAG Service Context Retrieval Error:', error);
      return {
        hasContext: false,
        formattedContext: 'Failed to retrieve knowledge context.',
        rawDocuments: []
      };
    }
  }

  async searchPolicies(query) {
    return this.retrieveContext(query, { docType: 'policy', topK: 4, minScore: 0.25 });
  }

  async searchProducts(query) {
    return this.retrieveContext(query, { docType: 'product', topK: 5, minScore: 0.35 });
  }
}

module.exports = new RAGService();
