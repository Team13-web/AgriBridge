import { query } from '../config/db.js';

/**
 * RAG Knowledge Retrieval Service
 * Performs full-text / keyword / crop semantic similarity search across verified agricultural documents.
 */
export async function getRelevantKnowledge({ queryText, category = 'GENERAL_AGRICULTURE', crop = null, language = 'en' }) {
  try {
    const cleanQuery = (queryText || '').toLowerCase().trim();
    
    // Extract key search tokens
    const tokens = cleanQuery
      .replace(/[^\w\s\u0C00-\u0C7F]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);

    let sql = `SELECT * FROM agriculture_knowledge WHERE (language = ? OR language = 'en')`;
    const params = [language];

    // Filter by crop if specified
    if (crop && crop !== 'ALL') {
      sql += ` AND (crop = ? OR crop = 'ALL')`;
      params.push(crop);
    }

    // Retrieve documents
    const documents = await query(sql, params);

    if (!documents || documents.length === 0) {
      return { context: '', sources: [] };
    }

    // Rank documents by token match overlap in title, keywords, and content
    const scoredDocs = documents.map(doc => {
      let score = 0;
      const combinedText = `${doc.title} ${doc.keywords || ''} ${doc.content}`.toLowerCase();

      tokens.forEach(token => {
        if (combinedText.includes(token)) score += 3;
        if ((doc.keywords || '').toLowerCase().includes(token)) score += 5;
        if (doc.title.toLowerCase().includes(token)) score += 8;
      });

      if (category && doc.category === category) score += 4;
      if (crop && doc.crop === crop) score += 6;

      return { doc, score };
    });

    // Sort descending by score
    scoredDocs.sort((a, b) => b.score - a.score);

    // Pick top 3 relevant documents
    const topMatches = scoredDocs.filter(d => d.score > 0).slice(0, 3).map(d => d.doc);

    // If no strong keyword match, take the top 2 category/crop default documents
    const selectedDocs = topMatches.length > 0 ? topMatches : documents.slice(0, 2);

    const contextParts = selectedDocs.map(d => `[Source: ${d.title} (${d.source})]\n${d.content}`);
    const sources = selectedDocs.map(d => ({
      title: d.title,
      source: d.source,
      category: d.category
    }));

    return {
      context: contextParts.join('\n\n'),
      sources
    };
  } catch (error) {
    console.warn('RAG Retrieval Error:', error.message);
    return { context: '', sources: [] };
  }
}
