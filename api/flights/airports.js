import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const keyword = (req.query.search || req.query.query || '').toString();
    if (keyword.length < 1) return res.json({ data: [] });

    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST || 'sky-scrapper.p.rapidapi.com';

    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    const response = await axios.get(`https://${apiHost}/api/v1/flights/searchAirport`, {
      params: { query: keyword, locale: 'en-US' },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    });

    // Map Skyscraper airport format back to Amadeus-like format for frontend compatibility
    const mapped = (response.data?.data || []).map(item => ({
      id: item.skyId,
      name: item.presentation.title,
      detailedName: item.presentation.suggestionTitle,
      iataCode: item.skyId, // Skyscraper uses skyId as IATA-like code
      address: {
        cityName: item.presentation.subtitle,
        countryName: item.presentation.subtitle.split(',').pop().trim()
      },
      skyId: item.skyId,
      entityId: item.entityId
    }));

    res.json({ data: mapped });
  } catch (err) {
    console.error('Airports search error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
