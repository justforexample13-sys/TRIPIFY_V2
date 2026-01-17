import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const city = req.query.city || req.query.cityCode || 'Dubai';
    const checkInDate = req.query.checkInDate;
    const checkOutDate = req.query.checkOutDate;

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    const params = {
      engine: 'google_hotels',
      q: city,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: '2',
      currency: 'USD',
      gl: 'us',
      hl: 'en',
      api_key: apiKey
    };

    console.log('Fetching hotel deals for:', city);

    const response = await axios.get('https://serpapi.com/search.json', { params, timeout: 5000 });
    const results = response.data;
    const properties = results.properties || [];

    // Map to frontend expectation
    const mapped = properties.map((prop, idx) => ({
      id: prop.property_token || `hotel-${idx}`,
      hotel: {
        hotelId: prop.property_token,
        name: prop.name,
        cityCode: city,
      },
      offers: [
        {
          price: {
            total: prop.total_rate?.lowest?.replace(/[^0-9.]/g, '') ||
              prop.rate_per_night?.lowest?.replace(/[^0-9.]/g, '') || '0',
            currency: 'USD'
          }
        }
      ]
    }));

    res.json({
      data: mapped,
      message: mapped.length > 0 ? 'Found great hotel deals!' : 'No special hotel deals found.'
    });
  } catch (err) {
    console.error('Hotel deals error:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch hotel deals',
    });
  }
}
