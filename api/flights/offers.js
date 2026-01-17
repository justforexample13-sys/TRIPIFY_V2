import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, date, returnDate, adults, class: travelClass } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ error: 'Missing required params: from, to, date' });
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    // Map travel class to SerpApi format: 1-Economy, 2-Premium economy, 3-Business, 4-First
    const classMap = {
      'ECONOMY': '1',
      'PREMIUM_ECONOMY': '2',
      'BUSINESS': '3',
      'FIRST': '4'
    };

    const params = {
      engine: 'google_flights',
      departure_id: from.toUpperCase(),
      arrival_id: to.toUpperCase(),
      outbound_date: date,
      currency: 'USD',
      hl: 'en',
      gl: 'us',
      api_key: apiKey,
      type: returnDate ? '1' : '2',
      adults: adults || '1',
      travel_class: classMap[travelClass?.toUpperCase()] || '1'
    };

    if (returnDate) {
      params.return_date = returnDate;
    }

    console.log('Searching flights via SerpApi:', params.departure_id, '->', params.arrival_id);

    const response = await axios.get('https://serpapi.com/search.json', { params });
    const results = response.data;

    if (results.error) {
      throw new Error(results.error);
    }

    // SerpApi combines flights into "best_flights" and "other_flights"
    const allFlights = [
      ...(results.best_flights || []),
      ...(results.other_flights || [])
    ];

    // Map to frontend format
    const mappedOffers = allFlights.map((flight, index) => {
      const price = flight.price || 0;

      // Each flight in SerpApi results might have multiple "flights" (legs/segments)
      // but usually for a simple search it's one leg with multiple segments if there are layovers
      const segments = (flight.flights || []).map(seg => ({
        departure: {
          iataCode: seg.departure_airport?.id,
          at: seg.departure_airport?.time
        },
        arrival: {
          iataCode: seg.arrival_airport?.id,
          at: seg.arrival_airport?.time
        },
        carrierCode: seg.airline,
        number: seg.flight_number,
        duration: seg.duration ? `PT${Math.floor(seg.duration / 60)}H${seg.duration % 60}M` : 'PT0H'
      }));

      return {
        id: `serp-${index}`,
        price: {
          total: price,
          currency: 'USD'
        },
        itineraries: [
          {
            segments: segments,
            duration: flight.total_duration ? `PT${Math.floor(flight.total_duration / 60)}H${flight.total_duration % 60}M` : 'PT0H'
          }
        ],
        // Mocked traveler pricings for frontend compatibility
        travelerPricings: [
          {
            fareDetailsBySegment: [
              { cabin: travelClass?.toUpperCase() || 'ECONOMY' }
            ]
          }
        ],
        validatingAirlineCodes: [segments[0]?.carrierCode || 'Unknown'],
        oneWay: !returnDate
      };
    });

    res.json({
      data: mappedOffers,
      dictionaries: { carriers: {}, locations: {} }
    });

  } catch (err) {
    console.error('SerpApi Flight offers error:', err?.message);
    res.status(500).json({
      error: err?.message || 'Failed to fetch flight offers'
    });
  }
}
