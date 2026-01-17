import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Skyscraper doesn't have a direct inspiration/deals API equivalent to Amadeus.
    // We return an empty array to prevent 500 errors in the frontend.
    return res.json({
      data: [],
      message: 'Flight deals are temporarily unavailable. Please use the flight search.'
    });
  } catch (err) {
    console.error('Flight deals error:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch flight deals',
    });
  }
}
