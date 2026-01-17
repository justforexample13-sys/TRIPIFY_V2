import axios from 'axios';

const DEAL_DESTINATIONS = ['DXB', 'LHR', 'CDG', 'SIN', 'JFK', 'BKK', 'IST', 'AMS'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const origin = (req.query.origin || 'DXB').toUpperCase();
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : 500;

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    // We'll fetch deals to a few popular destinations in parallel
    // To save quota, we'll only pick 4 randomized destinations from our list
    const selectedDests = DEAL_DESTINATIONS
      .filter(d => d !== origin)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    const date = new Date();
    date.setDate(date.getDate() + 30); // Search 30 days ahead
    const outboundDate = date.toISOString().split('T')[0];

    console.log(`Fetching flight deals from ${origin} to ${selectedDests.join(', ')}`);

    const dealPromises = selectedDests.map(async (dest) => {
      try {
        const params = {
          engine: 'google_flights',
          departure_id: origin,
          arrival_id: dest,
          outbound_date: outboundDate,
          currency: 'USD',
          hl: 'en',
          gl: 'us',
          api_key: apiKey,
          type: '2', // One way for simplicity in deals
          adults: '1'
        };

        const response = await axios.get('https://serpapi.com/search.json', { params, timeout: 5000 });
        const results = response.data;

        // Pick the cheapest flight from best_flights
        const cheapest = (results.best_flights || [])[0] || (results.other_flights || [])[0];

        if (cheapest && cheapest.price <= maxPrice) {
          return {
            id: `deal-${origin}-${dest}`,
            origin,
            destination: dest,
            departureDate: outboundDate,
            price: {
              total: cheapest.price,
              currency: 'USD'
            }
          };
        }
        return null;
      } catch (err) {
        console.error(`Error fetching deal ${origin}->${dest}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(dealPromises);
    const validDeals = results.filter(d => d !== null);

    res.json({
      data: validDeals,
      message: validDeals.length > 0 ? 'Fresh deals found!' : 'No exceptional deals found for these filters.'
    });
  } catch (err) {
    console.error('Flight deals error:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch flight deals',
    });
  }
}
