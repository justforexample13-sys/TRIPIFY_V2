import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Returning empty results to avoid 500 errors from deprecated Amadeus endpoints.
    // Users should use the primary hotel search feature.
    return res.json({
      data: [],
      meta: {
        cityCode: req.query.city || req.query.cityCode,
        checkInDate: req.query.checkInDate,
        checkOutDate: req.query.checkOutDate
      },
      message: 'Hotel deals are temporarily unavailable. Please use the hotel search.'
    });
  } catch (err) {
    console.error('Hotel deals error:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch hotel deals',
    });
  }
}
