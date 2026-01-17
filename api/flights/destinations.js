import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Skyscraper API (via RapidAPI) doesn't have a direct "inspiration" or "flight-destinations" API.
  // We'll return an empty array for now to prevent crashes in the frontend,
  // or you could replace this with a set of popular static destinations.

  try {
    res.json({ data: [] });
  } catch (err) {
    console.error('Flight destinations error:', err.message);
    res.json({ data: [] });
  }
}
