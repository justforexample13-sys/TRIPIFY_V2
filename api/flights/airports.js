import axios from 'axios';

let amadeusToken = null;
let amadeusTokenExpiresAt = 0;

async function getAmadeusToken() {
  const now = Date.now();
  if (amadeusToken && now < amadeusTokenExpiresAt - 30000) {
    return amadeusToken;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  const baseUrl = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';

  if (!apiKey || !apiSecret) {
    throw new Error('AMADEUS_API_KEY / AMADEUS_API_SECRET not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: apiSecret,
  });

  const response = await axios.post(`${baseUrl}/v1/security/oauth2/token`, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  amadeusToken = response.data?.access_token;
  amadeusTokenExpiresAt = Date.now() + (response.data?.expires_in || 1799) * 1000;
  return amadeusToken;
}

async function amadeusFetch(endpoint, params = {}) {
  const token = await getAmadeusToken();
  const baseUrl = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';

  const url = new URL(`${baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await axios.get(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const keyword = (req.query.search || req.query.query || '').toString();
    if (keyword.length < 1) return res.json({ data: [] });

    const params = {
      subType: 'AIRPORT,CITY',
      keyword,
      'page[limit]': '10',
      view: 'LIGHT'
    };

    const data = await amadeusFetch('/v1/reference-data/locations', params);
    res.json(data);
  } catch (err) {
    console.error('Airports search error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
