import axios from 'axios';

const POPULAR_AIRPORTS = [
  { id: 'DXB', name: 'Dubai International', detailedName: 'Dubai (DXB)', iataCode: 'DXB', address: { cityName: 'Dubai', countryName: 'UAE' }, skyId: 'DXB', entityId: 'DXB' },
  { id: 'LHR', name: 'London Heathrow', detailedName: 'London (LHR)', iataCode: 'LHR', address: { cityName: 'London', countryName: 'UK' }, skyId: 'LHR', entityId: 'LHR' },
  { id: 'JFK', name: 'John F. Kennedy', detailedName: 'New York (JFK)', iataCode: 'JFK', address: { cityName: 'New York', countryName: 'USA' }, skyId: 'JFK', entityId: 'JFK' },
  { id: 'CDG', name: 'Charles de Gaulle', detailedName: 'Paris (CDG)', iataCode: 'CDG', address: { cityName: 'Paris', countryName: 'France' }, skyId: 'CDG', entityId: 'CDG' },
  { id: 'SIN', name: 'Changi Airport', detailedName: 'Singapore (SIN)', iataCode: 'SIN', address: { cityName: 'Singapore', countryName: 'Singapore' }, skyId: 'SIN', entityId: 'SIN' },
  { id: 'IST', name: 'Istanbul Airport', detailedName: 'Istanbul (IST)', iataCode: 'IST', address: { cityName: 'Istanbul', countryName: 'Turkey' }, skyId: 'IST', entityId: 'IST' },
  { id: 'BKK', name: 'Suvarnabhumi', detailedName: 'Bangkok (BKK)', iataCode: 'BKK', address: { cityName: 'Bangkok', countryName: 'Thailand' }, skyId: 'BKK', entityId: 'BKK' },
  { id: 'HND', name: 'Haneda Airport', detailedName: 'Tokyo (HND)', iataCode: 'HND', address: { cityName: 'Tokyo', countryName: 'Japan' }, skyId: 'HND', entityId: 'HND' },
  { id: 'LAX', name: 'Los Angeles Intl', detailedName: 'Los Angeles (LAX)', iataCode: 'LAX', address: { cityName: 'Los Angeles', countryName: 'USA' }, skyId: 'LAX', entityId: 'LAX' },
  { id: 'FRA', name: 'Frankfurt Airport', detailedName: 'Frankfurt (FRA)', iataCode: 'FRA', address: { cityName: 'Frankfurt', countryName: 'Germany' }, skyId: 'FRA', entityId: 'FRA' },
  { id: 'AMS', name: 'Schiphol', detailedName: 'Amsterdam (AMS)', iataCode: 'AMS', address: { cityName: 'Amsterdam', countryName: 'Netherlands' }, skyId: 'AMS', entityId: 'AMS' },
  { id: 'SYD', name: 'Kingsford Smith', detailedName: 'Sydney (SYD)', iataCode: 'SYD', address: { cityName: 'Sydney', countryName: 'Australia' }, skyId: 'SYD', entityId: 'SYD' },
  { id: 'DOH', name: 'Hamad Intl', detailedName: 'Doha (DOH)', iataCode: 'DOH', address: { cityName: 'Doha', countryName: 'Qatar' }, skyId: 'DOH', entityId: 'DOH' },
  { id: 'MUC', name: 'Munich Airport', detailedName: 'Munich (MUC)', iataCode: 'MUC', address: { cityName: 'Munich', countryName: 'Germany' }, skyId: 'MUC', entityId: 'MUC' },
  { id: 'MAD', name: 'Adolfo Suárez', detailedName: 'Madrid (MAD)', iataCode: 'MAD', address: { cityName: 'Madrid', countryName: 'Spain' }, skyId: 'MAD', entityId: 'MAD' },
  { id: 'BCN', name: 'El Prat', detailedName: 'Barcelona (BCN)', iataCode: 'BCN', address: { cityName: 'Barcelona', countryName: 'Spain' }, skyId: 'BCN', entityId: 'BCN' },
  { id: 'SFO', name: 'San Francisco Intl', detailedName: 'San Francisco (SFO)', iataCode: 'SFO', address: { cityName: 'San Francisco', countryName: 'USA' }, skyId: 'SFO', entityId: 'SFO' },
  { id: 'ORD', name: 'O Hare Intl', detailedName: 'Chicago (ORD)', iataCode: 'ORD', address: { cityName: 'Chicago', countryName: 'USA' }, skyId: 'ORD', entityId: 'ORD' },
  { id: 'ATL', name: 'Hartsfield-Jackson', detailedName: 'Atlanta (ATL)', iataCode: 'ATL', address: { cityName: 'Atlanta', countryName: 'USA' }, skyId: 'ATL', entityId: 'ATL' },
  { id: 'MCO', name: 'Orlando Intl', detailedName: 'Orlando (MCO)', iataCode: 'MCO', address: { cityName: 'Orlando', countryName: 'USA' }, skyId: 'MCO', entityId: 'MCO' },
  { id: 'SEA', name: 'Seattle-Tacoma', detailedName: 'Seattle (SEA)', iataCode: 'SEA', address: { cityName: 'Seattle', countryName: 'USA' }, skyId: 'SEA', entityId: 'SEA' },
  { id: 'EWR', name: 'Newark Liberty', detailedName: 'Newark (EWR)', iataCode: 'EWR', address: { cityName: 'Newark', countryName: 'USA' }, skyId: 'EWR', entityId: 'EWR' },
  { id: 'DEN', name: 'Denver Intl', detailedName: 'Denver (DEN)', iataCode: 'DEN', address: { cityName: 'Denver', countryName: 'USA' }, skyId: 'DEN', entityId: 'DEN' },
  { id: 'BOS', name: 'Logan Intl', detailedName: 'Boston (BOS)', iataCode: 'BOS', address: { cityName: 'Boston', countryName: 'USA' }, skyId: 'BOS', entityId: 'BOS' },
  { id: 'YYZ', name: 'Pearson Intl', detailedName: 'Toronto (YYZ)', iataCode: 'YYZ', address: { cityName: 'Toronto', countryName: 'Canada' }, skyId: 'YYZ', entityId: 'YYZ' },
  { id: 'YVR', name: 'Vancouver Intl', detailedName: 'Vancouver (YVR)', iataCode: 'YVR', address: { cityName: 'Vancouver', countryName: 'Canada' }, skyId: 'YVR', entityId: 'YVR' },
  { id: 'FCO', name: 'Leonardo da Vinci', detailedName: 'Rome (FCO)', iataCode: 'FCO', address: { cityName: 'Rome', countryName: 'Italy' }, skyId: 'FCO', entityId: 'FCO' },
  { id: 'MXP', name: 'Malpensa', detailedName: 'Milan (MXP)', iataCode: 'MXP', address: { cityName: 'Milan', countryName: 'Italy' }, skyId: 'MXP', entityId: 'MXP' },
  { id: 'ZRH', name: 'Zurich Airport', detailedName: 'Zurich (ZRH)', iataCode: 'ZRH', address: { cityName: 'Zurich', countryName: 'Switzerland' }, skyId: 'ZRH', entityId: 'ZRH' },
  { id: 'VIE', name: 'Vienna Intl', detailedName: 'Vienna (VIE)', iataCode: 'VIE', address: { cityName: 'Vienna', countryName: 'Austria' }, skyId: 'VIE', entityId: 'VIE' },
  { id: 'HKG', name: 'Hong Kong Intl', detailedName: 'Hong Kong (HKG)', iataCode: 'HKG', address: { cityName: 'Hong Kong', countryName: 'Hong Kong' }, skyId: 'HKG', entityId: 'HKG' },
  { id: 'DEL', name: 'Indira Gandhi', detailedName: 'Delhi (DEL)', iataCode: 'DEL', address: { cityName: 'Delhi', countryName: 'India' }, skyId: 'DEL', entityId: 'DEL' },
  { id: 'BOM', name: 'Chhatrapati Shivaji', detailedName: 'Mumbai (BOM)', iataCode: 'BOM', address: { cityName: 'Mumbai', countryName: 'India' }, skyId: 'BOM', entityId: 'BOM' },
  { id: 'KUL', name: 'Kuala Lumpur Intl', detailedName: 'Kuala Lumpur (KUL)', iataCode: 'KUL', address: { cityName: 'Kuala Lumpur', countryName: 'Malaysia' }, skyId: 'KUL', entityId: 'KUL' },
  { id: 'ICN', name: 'Incheon Intl', detailedName: 'Seoul (ICN)', iataCode: 'ICN', address: { cityName: 'Seoul', countryName: 'South Korea' }, skyId: 'ICN', entityId: 'ICN' },
  { id: 'MEL', name: 'Melbourne Airport', detailedName: 'Melbourne (MEL)', iataCode: 'MEL', address: { cityName: 'Melbourne', countryName: 'Australia' }, skyId: 'MEL', entityId: 'MEL' },
  { id: 'CPH', name: 'Copenhagen Airport', detailedName: 'Copenhagen (CPH)', iataCode: 'CPH', address: { cityName: 'Copenhagen', countryName: 'Denmark' }, skyId: 'CPH', entityId: 'CPH' },
  { id: 'ARN', name: 'Arlanda Airport', detailedName: 'Stockholm (ARN)', iataCode: 'ARN', address: { cityName: 'Stockholm', countryName: 'Sweden' }, skyId: 'ARN', entityId: 'ARN' },
  { id: 'HEL', name: 'Helsinki Airport', detailedName: 'Helsinki (HEL)', iataCode: 'HEL', address: { cityName: 'Helsinki', countryName: 'Finland' }, skyId: 'HEL', entityId: 'HEL' },
  { id: 'OSL', name: 'Oslo Airport', detailedName: 'Oslo (OSL)', iataCode: 'OSL', address: { cityName: 'Oslo', countryName: 'Norway' }, skyId: 'OSL', entityId: 'OSL' },
  { id: 'DUB', name: 'Dublin Airport', detailedName: 'Dublin (DUB)', iataCode: 'DUB', address: { cityName: 'Dublin', countryName: 'Ireland' }, skyId: 'DUB', entityId: 'DUB' },
  { id: 'LIS', name: 'Lisbon Airport', detailedName: 'Lisbon (LIS)', iataCode: 'LIS', address: { cityName: 'Lisbon', countryName: 'Portugal' }, skyId: 'LIS', entityId: 'LIS' },
  { id: 'ATH', name: 'Eleftherios Venizelos', detailedName: 'Athens (ATH)', iataCode: 'ATH', address: { cityName: 'Athens', countryName: 'Greece' }, skyId: 'ATH', entityId: 'ATH' },
  { id: 'CAI', name: 'Cairo Intl', detailedName: 'Cairo (CAI)', iataCode: 'CAI', address: { cityName: 'Cairo', countryName: 'Egypt' }, skyId: 'CAI', entityId: 'CAI' },
  { id: 'JNB', name: 'OR Tambo', detailedName: 'Johannesburg (JNB)', iataCode: 'JNB', address: { cityName: 'Johannesburg', countryName: 'South Africa' }, skyId: 'JNB', entityId: 'JNB' },
  { id: 'CPT', name: 'Cape Town Intl', detailedName: 'Cape Town (CPT)', iataCode: 'CPT', address: { cityName: 'Cape Town', countryName: 'South Africa' }, skyId: 'CPT', entityId: 'CPT' },
  { id: 'GRU', name: 'Guarulhos Intl', detailedName: 'Sao Paulo (GRU)', iataCode: 'GRU', address: { cityName: 'Sao Paulo', countryName: 'Brazil' }, skyId: 'GRU', entityId: 'GRU' },
  { id: 'EZE', name: 'Ministro Pistarini', detailedName: 'Buenos Aires (EZE)', iataCode: 'EZE', address: { cityName: 'Buenos Aires', countryName: 'Argentina' }, skyId: 'EZE', entityId: 'EZE' },
  { id: 'MEX', name: 'Benito Juárez', detailedName: 'Mexico City (MEX)', iataCode: 'MEX', address: { cityName: 'Mexico City', countryName: 'Mexico' }, skyId: 'MEX', entityId: 'MEX' },
];

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const keyword = (req.query.search || req.query.query || '').toString().toLowerCase();

    // Check cache
    const cached = cache.get(keyword);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json({ data: cached.data });
    }

    // Filter local dataset for instant results
    const localMatches = POPULAR_AIRPORTS.filter(a =>
      a.name.toLowerCase().includes(keyword) ||
      a.iataCode.toLowerCase().includes(keyword) ||
      a.address.cityName.toLowerCase().includes(keyword)
    );

    // If query is empty, just return top popular
    if (keyword.length === 0) {
      return res.json({ data: POPULAR_AIRPORTS.slice(0, 10) });
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    const params = {
      engine: 'google_flights_autocomplete',
      q: keyword,
      api_key: apiKey,
      hl: 'en',
      gl: 'us'
    };

    console.log('Searching airports via SerpApi for:', keyword);

    let mapped = [];
    try {
      const response = await axios.get('https://serpapi.com/search.json', { params, timeout: 5000 });
      const results = response.data;
      const suggestions = results.suggestions || [];

      mapped = suggestions.map(item => {
        // Use the ID as iataCode if it looks like one, or just keep it as is
        // SerpApi IDs can be cities (PAR) or specific airports (CDG)
        const id = item.id || '';
        return {
          id: id,
          name: item.title,
          detailedName: id ? `${item.title} (${id})` : item.title,
          iataCode: id, // Don't restrict to 3 letters here, let the frontend decide
          address: {
            cityName: item.subtitle ? item.subtitle.split(',')[0].trim() : item.title,
            countryName: item.subtitle ? item.subtitle.split(',').pop().trim() : ''
          },
          skyId: id,
          entityId: id
        };
      });
    } catch (apiErr) {
      console.warn('SerpApi Autocomplete failed, falling back to local dataset:', apiErr.message);
      mapped = localMatches;
    }

    // Merge: Prioritize API results as requested by user ("fetch from api then add")
    // Use a Map to de-duplicate by ID
    const resultsMap = new Map();

    // Add API matches first
    mapped.forEach(item => {
      if (item.id) resultsMap.set(item.id, item);
    });

    // Add local matches if they aren't already there
    localMatches.forEach(item => {
      if (!resultsMap.has(item.id)) {
        resultsMap.set(item.id, item);
      }
    });

    const finalResults = Array.from(resultsMap.values());

    // Cache result
    cache.set(keyword, { data: finalResults, timestamp: Date.now() });

    res.json({ data: finalResults });
  } catch (err) {
    console.error('Airports search error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
