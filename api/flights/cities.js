import axios from 'axios';

// Simple in-memory cache to save API quota
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

const POPULAR_CITIES = [
  { code: 'NYC', name: 'New York', country: 'USA', countryName: 'United States', skyId: 'NYC', entityId: 'NYC' },
  { code: 'LON', name: 'London', country: 'UK', countryName: 'United Kingdom', skyId: 'LON', entityId: 'LON' },
  { code: 'PAR', name: 'Paris', country: 'France', countryName: 'France', skyId: 'PAR', entityId: 'PAR' },
  { code: 'DXB', name: 'Dubai', country: 'UAE', countryName: 'United Arab Emirates', skyId: 'DXB', entityId: 'DXB' },
  { code: 'TYO', name: 'Tokyo', country: 'Japan', countryName: 'Japan', skyId: 'TYO', entityId: 'TYO' },
  { code: 'SIN', name: 'Singapore', country: 'Singapore', countryName: 'Singapore', skyId: 'SIN', entityId: 'SIN' },
  { code: 'IST', name: 'Istanbul', country: 'Turkey', countryName: 'Turkey', skyId: 'IST', entityId: 'IST' },
  { code: 'ROM', name: 'Rome', country: 'Italy', countryName: 'Italy', skyId: 'ROM', entityId: 'ROM' },
  { code: 'BKK', name: 'Bangkok', country: 'Thailand', countryName: 'Thailand', skyId: 'BKK', entityId: 'BKK' },
  { code: 'BCN', name: 'Barcelona', country: 'Spain', countryName: 'Spain', skyId: 'BCN', entityId: 'BCN' },
  { code: 'AMS', name: 'Amsterdam', country: 'Netherlands', countryName: 'Netherlands', skyId: 'AMS', entityId: 'AMS' },
  { code: 'HKG', name: 'Hong Kong', country: 'China', countryName: 'China', skyId: 'HKG', entityId: 'HKG' },
  { code: 'SYD', name: 'Sydney', country: 'Australia', countryName: 'Australia', skyId: 'SYD', entityId: 'SYD' },
  { code: 'MIA', name: 'Miami', country: 'USA', countryName: 'United States', skyId: 'MIA', entityId: 'MIA' },
  { code: 'LAX', name: 'Los Angeles', country: 'USA', countryName: 'United States', skyId: 'LAX', entityId: 'LAX' },
  { code: 'SFO', name: 'San Francisco', country: 'USA', countryName: 'United States', skyId: 'SFO', entityId: 'SFO' },
  { code: 'BER', name: 'Berlin', country: 'Germany', countryName: 'Germany', skyId: 'BER', entityId: 'BER' },
  { code: 'MAD', name: 'Madrid', country: 'Spain', countryName: 'Spain', skyId: 'MAD', entityId: 'MAD' },
  { code: 'MIL', name: 'Milan', country: 'Italy', countryName: 'Italy', skyId: 'MIL', entityId: 'MIL' },
  { code: 'OSL', name: 'Oslo', country: 'Norway', countryName: 'Norway', skyId: 'OSL', entityId: 'OSL' },
  { code: 'CPH', name: 'Copenhagen', country: 'Denmark', countryName: 'Denmark', skyId: 'CPH', entityId: 'CPH' },
  { code: 'VIE', name: 'Vienna', country: 'Austria', countryName: 'Austria', skyId: 'VIE', entityId: 'VIE' },
  { code: 'ZRH', name: 'Zurich', country: 'Switzerland', countryName: 'Switzerland', skyId: 'ZRH', entityId: 'ZRH' },
  { code: 'MUC', name: 'Munich', country: 'Germany', countryName: 'Germany', skyId: 'MUC', entityId: 'MUC' },
  { code: 'MEX', name: 'Mexico City', country: 'Mexico', countryName: 'Mexico', skyId: 'MEX', entityId: 'MEX' },
  { code: 'GRU', name: 'Sao Paulo', country: 'Brazil', countryName: 'Brazil', skyId: 'GRU', entityId: 'GRU' },
  { code: 'EZE', name: 'Buenos Aires', country: 'Argentina', countryName: 'Argentina', skyId: 'EZE', entityId: 'EZE' },
  { code: 'CAI', name: 'Cairo', country: 'Egypt', countryName: 'Egypt', skyId: 'CAI', entityId: 'CAI' },
  { code: 'DEL', name: 'Delhi', country: 'India', countryName: 'India', skyId: 'DEL', entityId: 'DEL' },
  { code: 'BOM', name: 'Mumbai', country: 'India', countryName: 'India', skyId: 'BOM', entityId: 'BOM' },
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = (req.query.query || req.query.search || req.query.keyword || '').toString();
    const keyword = raw.split(',')[0].trim().toLowerCase();

    // Check cache
    const cached = cache.get(keyword);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json({ cities: cached.data });
    }

    // Filter local dataset for instant results
    const localMatches = POPULAR_CITIES.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      c.code.toLowerCase().includes(keyword) ||
      c.country.toLowerCase().includes(keyword)
    );

    // If query is very short, just return local matches
    if (keyword.length < 2) {
      return res.json({ cities: localMatches.length > 0 ? localMatches : POPULAR_CITIES.slice(0, 10) });
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

    let mapped = [];
    try {
      const response = await axios.get('https://serpapi.com/search.json', { params, timeout: 3000 });
      const results = response.data;
      const suggestions = results.suggestions || [];

      mapped = suggestions.map(item => ({
        code: item.id,
        name: item.title,
        country: item.subtitle || '',
        countryName: item.subtitle || '',
        skyId: item.id,
        entityId: item.id
      }));
    } catch (apiErr) {
      console.warn('SerpApi Autocomplete failed for cities, falling back to local dataset:', apiErr.message);
      mapped = localMatches;
    }

    // Merge API results with local matches
    const finalResults = [...localMatches];
    mapped.forEach(apiItem => {
      if (!finalResults.find(l => l.code === apiItem.code)) {
        finalResults.push(apiItem);
      }
    });

    // Cache the result
    cache.set(keyword, { data: finalResults, timestamp: Date.now() });

    res.json({ cities: finalResults });
  } catch (err) {
    console.error('Cities search error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
