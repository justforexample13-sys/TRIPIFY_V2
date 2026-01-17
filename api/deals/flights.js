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
  if (!apiKey || !apiSecret) {
    throw new Error('AMADEUS_API_KEY / AMADEUS_API_SECRET not configured');
  }

  const baseUrl = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: apiSecret,
  });

  const response = await axios.post(`${baseUrl}/v1/security/oauth2/token`, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  amadeusToken = response.data?.access_token;
  amadeusTokenExpiresAt = Date.now() + (response.data?.expires_in || 0) * 1000;
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
    const originInput = String(req.query.origin || '').toUpperCase().trim();
    const maxPrice = req.query.maxPrice;
    const departureDate = req.query.departureDate;
    const oneWay = req.query.oneWay;

    if (!originInput) {
      return res.status(400).json({ error: 'origin is required' });
    }

    const originFallbacks = {
      LON: 'LHR',
      PAR: 'CDG',
      NYC: 'JFK',
      ROM: 'FCO',
      MIL: 'MXP',
      TYO: 'HND',
    };

    const mappedOrigin = originFallbacks[originInput] || originInput;

    const params = { origin: mappedOrigin };
    if (maxPrice) params.maxPrice = maxPrice;
    if (departureDate) params.departureDate = departureDate;
    if (oneWay !== undefined) params.oneWay = oneWay;

    try {
      const data = await amadeusFetch('/v1/shopping/flight-destinations', params);
      return res.json(data);
    } catch (err) {
      const first = err?.response?.data?.errors?.[0];
      const isSystemError = (err?.response?.status >= 500) || first?.code === 141;

      if (isSystemError) {
        return res.status(200).json({
          data: [],
          message: 'Flight deals are temporarily unavailable. Please try again.',
        });
      }

      throw err;
    }
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Failed to fetch flight deals',
    });
  }
}
