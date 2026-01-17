import axios from 'axios';

// Simple in-memory cache to save API quota
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = (req.query.query || req.query.search || req.query.keyword || '').toString();
    const keyword = raw.split(',')[0].trim().toLowerCase();
    if (keyword.length < 1) return res.json({ cities: [] });

    // Check cache
    const cached = cache.get(keyword);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json({ cities: cached.data });
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    const params = {
      engine: 'google_flights_autocomplete',
      q: keyword,
      api_key: apiKey,
      hl: 'en',
      gl: 'us'
    };

    console.log('Searching cities via SerpApi for:', keyword);

    const response = await axios.get('https://serpapi.com/search.json', { params });
    const results = response.data;

    // SerpApi returns suggestions in 'suggestions' array
    const suggestions = results.suggestions || [];

    const cities = suggestions
      .filter(item => item.id && item.id.length === 3) // Filter for items with IATA codes
      .map((item) => ({
        code: item.id,
        name: item.title,
        country: item.subtitle,
        countryName: item.subtitle,
        skyId: item.id,
        entityId: item.id // Using IATA as entityId as well
      }));

    // Cache the result
    cache.set(keyword, { data: cities, timestamp: Date.now() });

    res.json({ cities });
  } catch (err) {
    console.error('SerpApi City search error:', err?.message);
    res.status(500).json({
      error: err?.message || 'City search failed'
    });
  }
}
