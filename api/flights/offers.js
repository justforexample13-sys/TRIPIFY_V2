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

    // 1. We first need to resolve the "SkyId" and "EntityId" for origin and destination
    // The frontend sends IATA codes (e.g. LHR, JFK). We need to search them first.
    // In a real app, the frontend should probably do this autocomplete and send the IDs directly.
    // For now, we will do a lookup here to keep compatibility.

    const originCode = from.toUpperCase();
    const destinationCode = to.toUpperCase();

    // Helper to get location details
    const getLocationDetails = async (query) => {
      if (!query) return null;
      try {
        const response = await axios.get(`https://${process.env.RAPIDAPI_HOST}/api/v1/flights/searchAirport`, {
          params: { query },
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
          }
        });
        // Find exact match or first result
        const exact = response.data?.data?.find(d => d.skyId === query) || response.data?.data?.[0];
        return exact;
      } catch (err) {
        console.error(`Location lookup failed for ${query}:`, err.message);
        return null;
      }
    };

    const [originLoc, destLoc] = await Promise.all([
      getLocationDetails(originCode),
      getLocationDetails(destinationCode)
    ]);

    if (!originLoc || !destLoc) {
      return res.status(400).json({ error: 'Invalid origin or destination code' });
    }

    // 2. Search for flights
    const params = {
      originSkyId: originLoc.skyId,
      destinationSkyId: destLoc.skyId,
      originEntityId: originLoc.entityId,
      destinationEntityId: destLoc.entityId,
      date: date,
      adults: adults || '1',
      currency: 'USD',
      market: 'en-US',
      countryCode: 'US'
    };

    if (returnDate) {
      params.returnDate = returnDate;
    }

    if (travelClass) {
      // API expects: economy, premium_economy, business, first
      const mapClass = {
        'ECONOMY': 'economy',
        'PREMIUM_ECONOMY': 'premium_economy',
        'BUSINESS': 'business',
        'FIRST': 'first'
      };
      params.cabinClass = mapClass[travelClass.toUpperCase()] || 'economy';
    }

    console.log('Searching flights with params:', params);

    const response = await axios.get(`https://${process.env.RAPIDAPI_HOST}/api/v1/flights/searchFlights`, {
      params,
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
      }
    });

    const rawData = response.data?.data;
    if (!rawData || !rawData.itineraries) {
      return res.json({ data: [] });
    }

    // 3. Map response to our frontend format (preserving Amadeus-like structure where possible for compatibility)
    // The frontend likely expects an array of offers.
    const mappedOffers = rawData.itineraries.map((itinerary, index) => {
      const price = itinerary.price?.formatted || `$${itinerary.price?.raw}`;

      const legs = itinerary.legs.map(leg => ({
        departure: {
          iataCode: leg.origin.displayCode,
          at: leg.departure,
          terminal: null // API might not always return terminal
        },
        arrival: {
          iataCode: leg.destination.displayCode,
          at: leg.arrival,
          terminal: null
        },
        carrierCode: leg.carriers.marketing[0]?.name || 'Unknown', // Simulating carrier code with name
        duration: `PT${Math.floor(leg.durationInMinutes / 60)}H${leg.durationInMinutes % 60}M`,
        segments: leg.segments.map(seg => ({
          departure: { iataCode: seg.origin.displayCode, at: seg.departure },
          arrival: { iataCode: seg.destination.displayCode, at: seg.arrival },
          carrierCode: seg.marketingCarrier?.name,
          number: seg.flightNumber
        }))
      }));

      return {
        id: itinerary.id,
        price: {
          total: itinerary.price?.raw,
          currency: 'USD'
        },
        itineraries: legs.map(leg => ({
          segments: leg.segments,
          duration: leg.duration
        })),
        // Adding travelerPricings for hook compatibility (line 124 in useFlightSearch.ts)
        travelerPricings: [
          {
            fareDetailsBySegment: [
              { cabin: travelClass ? travelClass.toUpperCase() : 'ECONOMY' }
            ]
          }
        ],
        validatingAirlineCodes: [legs[0].carrierCode],
        oneWay: !returnDate,
      };
    });

    res.json({
      data: mappedOffers,
      dictionaries: { carriers: {}, locations: {} } // Empty for hook safety
    });

  } catch (err) {
    console.error('Flight offers error:', err?.message);
    res.status(err?.response?.status || 500).json({
      error: err?.message || 'Failed to fetch flight offers',
      details: err?.response?.data
    });
  }
}
