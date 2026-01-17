import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getLocationDetails(query: string, apiKey: string, apiHost: string) {
  if (!query) return null;
  const url = `https://${apiHost}/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    });
    const json = await res.json();
    return json.data?.[0]; // return first match
  } catch (error) {
    console.error('Location lookup error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin } = await req.json();

    const originCode = String(origin || '').toUpperCase().trim();
    if (!originCode) {
      return new Response(JSON.stringify({ destinations: [], error: 'origin is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    const apiHost = Deno.env.get('RAPIDAPI_HOST') || 'sky-scrapper.p.rapidapi.com';

    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // 1. Get Origin Entity ID
    const originLoc = await getLocationDetails(originCode, apiKey, apiHost);

    // If we can't find the airport, just return empty
    if (!originLoc) {
      return new Response(JSON.stringify({ destinations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. "Everywhere" search to duplicate "Flight Destinations" behavior
    // Skyscraper has an endpoint for "searchFlightEverywhere" but it might be deprecated or behave differently.
    // We will try to use the generic search with "Everywhere" destination if possible, or use a map-based endpoint.
    // However, looking at the user provided list, 'searchFlightEverywhere' exists. Let's try to use it.

    const url = `https://${apiHost}/api/v1/flights/searchFlightEverywhere?originSkyId=${originLoc.skyId}&originEntityId=${originLoc.entityId}`;
    console.log('Fetching Everywhere flights:', url);

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      },
    });

    const json = await response.json();

    if (!json.status || !json.data) {
      console.error('Skyscraper API error or empty:', json);
      return new Response(JSON.stringify({ destinations: [], raw: json }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Map results
    // The structure might differ, so we'll map carefully.
    // Usually "Everywhere" returns a list of countries or destinations with price.
    const destinations = json.data.map((item: any, index: number) => ({
      id: index + 1,
      origin: originCode,
      destination: item.content?.location?.name || 'Unknown', // This structure depends on actual API response
      destinationCode: item.content?.location?.skyCode, // We might need this for deeplinks
      price: item.content?.flightQuotes?.cheapest?.price, // Just a guess at structure, will need to be robust
      currency: 'USD',
      image: item.content?.image?.url
    }));

    return new Response(JSON.stringify({ destinations, raw: json }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in search-flight-destinations:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, destinations: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
