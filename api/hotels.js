import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const city = String(req.query.city || req.query.cityCode || '').trim();
    const checkInDate = String(req.query.checkIn || req.query.checkInDate || '').trim();
    const checkOutDate = String(req.query.checkOut || req.query.checkOutDate || '').trim();
    const adults = Number(req.query.adults || 1);

    if (!city) {
      return res.status(400).json({ error: 'city (IATA code or city keyword) is required' });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST || 'sky-scrapper.p.rapidapi.com';

    // 1. Search for Location (City) to get Entity ID
    // We use the same 'searchAirport' or a specific hotel location endpoint if available.
    // The user provided 'api/v1/hotels/searchDestinationOrHotel' which is likely the correct one for hotels.
    console.log(`Searching hotel location for: ${city}`);

    let locationId = null;
    let cityCode = city.toUpperCase(); /* Default to input if we can't find better */

    try {
      const destResponse = await axios.get(`https://${apiHost}/api/v1/hotels/searchDestinationOrHotel`, {
        params: { query: city },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      });

      // The API returns a list. we need to pick the best match (entityType = 'CITY' ideally)
      const bestMatch = destResponse.data?.data?.find(d => d.entityType === 'CITY') || destResponse.data?.data?.[0];

      if (!bestMatch) {
        return res.status(404).json({ error: 'City not found' });
      }
      locationId = bestMatch.entityId;
      cityCode = bestMatch.entityName || cityCode;

    } catch (err) {
      console.error('Hotel location search failed:', err.message);
      return res.status(502).json({ error: 'Location search failed' });
    }

    // 2. Search for Hotels
    // Using 'api/v1/hotels/searchHotels'
    // This typically requires entityId, checkin, checkout
    console.log(`Searching hotels in ${cityCode} (ID: ${locationId})`);

    const params = {
      entityId: locationId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: adults || '1',
      rooms: '1',
      limit: '20',
      currency: 'USD',
      market: 'en-US',
      countryCode: 'US'
    };

    // If dates are missing, the API might not return prices, or might return a generic list. 
    // We will try to fetch anyway.

    const hotelsResponse = await axios.get(`https://${apiHost}/api/v1/hotels/searchHotels`, {
      params,
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    });

    const rawData = hotelsResponse.data?.data?.hotels || []; // Adjust based on actual response structure

    // 3. Map to frontend format
    const hotels = rawData.map((h, index) => ({
      hotelId: h.hotelId,
      name: h.name,
      location: cityCode, // or h.location inside response
      rating: h.stars || h.rating || 0,
      reviews: h.reviewCount || 0,
      // Price might be in a different structure
      price: h.price ? parseFloat(h.price.replace(/[^0-9.]/g, '')) : 0,
      currency: 'USD', // API usually returns formatted string like "$100"
      amenities: [], // Detailed amenities might need a detail call, or are in h.amenities
      image: h.heroImage || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`, // Fallback
      type: 'Hotel'
    }));

    return res.json({
      data: hotels,
      meta: { cityCode, checkInDate, checkOutDate }
    });

  } catch (err) {
    console.error('Hotels proxy error:', err?.message);
    return res.status(err?.response?.status || 500).json({
      error: err?.message || 'Failed to fetch hotels',
      details: err?.response?.data
    });
  }
}
