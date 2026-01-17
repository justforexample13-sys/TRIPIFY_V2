import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Skyscraper handles flight availability within the searchFlights call.
  // Returning an empty array to match the expected format and avoid errors.
  try {
    res.json({ data: [] });
  } catch (err) {
    console.error('Flight dates error:', err.message);
    res.json({ data: [] });
  }
}
