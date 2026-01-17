const axios = require('axios');
require('dotenv').config();

async function test() {
    const apiKey = process.env.SERPAPI_KEY;
    const q = process.argv[2] || 'paris';

    try {
        const response = await axios.get('https://serpapi.com/search.json', {
            params: {
                engine: 'google_flights_autocomplete',
                q: q,
                api_key: apiKey
            }
        });

        console.log('Results for:', q);
        console.log(JSON.stringify(response.data.suggestions, null, 2));

        const mapped = (response.data.suggestions || [])
            .filter(item => item.id && item.id.length === 3)
            .map(item => ({
                code: item.id,
                name: item.title,
                subtitle: item.subtitle
            }));

        console.log('\nMapped (IATA filter):');
        console.log(JSON.stringify(mapped, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
