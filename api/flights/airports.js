import axios from 'axios';

// Simple in-memory cache to save API quota
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const keyword = (req.query.search || req.query.query || '').toString().toLowerCase();
    if (keyword.length < 1) return res.json({ data: [] });

    // Check cache
    const cached = cache.get(keyword);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json({ data: cached.data });
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

    console.log('Searching airports via SerpApi for:', keyword);

    const response = await axios.get('https://serpapi.com/search.json', { params });
    const results = response.data;

    const suggestions = results.suggestions || [];

    const mapped = suggestions
      .filter(item => item.id && item.id.length === 3)
      .map(item => ({
        id: item.id,
        name: item.title,
        detailedName: `${item.title} (${item.id})`,
        iataCode: item.id,
        address: {
          cityName: item.subtitle.split(',')[0].trim(),
          countryName: item.subtitle.split(',').pop().trim()
        },
        skyId: item.id,
        entityId: item.id
      }));

    // Cache result
    cache.set(keyword, { data: mapped, timestamp: Date.now() });

    res.json({ data: mapped });
  } catch (err) {
    console.error('SerpApi Airports search error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
