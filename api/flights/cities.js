import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = (req.query.query || req.query.search || req.query.keyword || '').toString();
    const keyword = raw.split(',')[0].trim();
    if (keyword.length < 1) return res.json({ cities: [] });

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

    const cities = (response.data?.data || [])
      .map((item) => ({
        code: item.skyId,
        name: item.presentation.title,
        country: item.presentation.subtitle.split(',').pop().trim(),
        countryName: item.presentation.subtitle.split(',').pop().trim(),
        skyId: item.skyId,
        entityId: item.entityId
      }));

    res.json({ cities });
  } catch (err) {
    console.error('Cities search error:', err?.message);
    res.status(500).json({
      error: err?.message || 'City search failed'
    });
  }
}
