import { query } from '../config/db.js';

/**
 * Weather RAG Knowledge Retrieval Service
 * Retrieves agronomic rules for weather-dependent farming decisions.
 */
export async function getAgriculturalWeatherKnowledge({ crop = 'Paddy', soilType = 'Loamy', season = 'Kharif', maxRainProb = 30 }) {
  try {
    const docs = await query(
      `SELECT * FROM agriculture_knowledge 
       WHERE category IN ('IRRIGATION', 'FERTILIZER', 'PEST_DISEASE', 'GENERAL_AGRICULTURE') 
       AND (crop = ? OR crop = 'ALL')
       LIMIT 6`,
      [crop]
    );

    const rules = [
      'If rain probability >= 60% or rainfall >= 10mm, postpone irrigation to prevent root rot and conserve groundwater.',
      'Do not apply chemical Nitrogen top-dressing (Urea) prior to heavy rains as runoff washes nutrients into drains.',
      'High humidity (> 75%) combined with warm temperature increases risk of fungal leaf blast and bacterial blight.',
      'Perform pesticide or neem oil foliar spraying during clear morning hours (06:00 AM - 08:30 AM) with wind speed < 15 km/h.',
      'Harvest mature crops during consecutive dry weather windows (rainfall < 2mm for 3 days) to preserve grain quality.'
    ];

    const contextText = docs.map(d => `• ${d.title}: ${d.content}`).join('\n');

    return {
      ragContext: contextText,
      agronomicRules: rules
    };
  } catch (err) {
    console.warn('Weather RAG error:', err.message);
    return { ragContext: '', agronomicRules: [] };
  }
}
