import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const city = String(req.query.city || req.query.cityCode || '').trim();
    const checkInDate = String(req.query.checkIn || req.query.checkInDate || '').trim();
    const checkOutDate = String(req.query.checkOut || req.query.checkOutDate || '').trim();
    const adults = String(req.query.adults || 1);
    const rooms = String(req.query.rooms || 1);

    if (!city || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'Missing required params: city, checkInDate, checkOutDate' });
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    // SerpApi Hotels uses a text query 'q'. 
    const cityMap = {
      'NYC': 'New York, NY',
      'LON': 'London, UK',
      'PAR': 'Paris, France',
      'DXB': 'Dubai, UAE',
      'TYO': 'Tokyo, Japan',
      'SFO': 'San Francisco, CA',
      'LAX': 'Los Angeles, CA'
    };

    const query = cityMap[city.toUpperCase()] || city;

    const params = {
      engine: 'google_hotels',
      q: query,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: adults,
      rooms: rooms,
      currency: 'USD',
      gl: 'us',
      hl: 'en',
      api_key: apiKey
    };

    console.log('Searching hotels via SerpApi for:', query);

    const response = await axios.get('https://serpapi.com/search.json', { params });
    const results = response.data;

    if (results.error) {
      throw new Error(results.error);
    }

    const properties = results.properties || [];

    // Map to frontend format
    const mappedHotels = properties.map((prop, index) => {
      const priceTotal = prop.total_rate?.lowest?.replace(/[^0-9.]/g, '') ||
        prop.rate_per_night?.lowest?.replace(/[^0-9.]/g, '') || '0';

      return {
        hotel: {
          hotelId: prop.property_token || `serp-h-${index}`,
          name: prop.name,
          rating: prop.overall_rating || 0,
          reviews: prop.reviews || 0,
          cityCode: city.toUpperCase(),
          address: { cityName: city },
          amenities: prop.amenities || [],
          type: 'Hotel'
        },
        offers: [
          {
            price: {
              total: priceTotal,
              currency: 'USD'
            }
          }
        ],
        // Flat properties for simplified hook logic
        price: parseFloat(priceTotal),
        currency: 'USD',
        image: prop.images?.[0]?.thumbnail || prop.thumbnail || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`
      };
    });

    res.json({ data: mappedHotels });

  } catch (err) {
    console.error('SerpApi Hotel search error:', err?.message);
    res.status(500).json({
      error: err?.message || 'Failed to fetch hotels'
    });
  }
}
