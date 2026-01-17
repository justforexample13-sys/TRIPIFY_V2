import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ cities: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('SERPAPI_KEY');
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    console.log('Searching cities via SerpApi for:', query);

    const params = new URLSearchParams({
      engine: 'google_flights_autocomplete',
      q: query,
      api_key: apiKey,
      hl: 'en',
      gl: 'us'
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    const response = await fetch(url);
    const results = await response.json();

    // SerpApi returns suggestions in 'suggestions' array
    const suggestions = results.suggestions || [];

    const cities = suggestions.map((item: any) => ({
      code: item.id,
      name: item.title,
      country: item.subtitle || '',
      countryName: item.subtitle || '',
      skyId: item.id,
      entityId: item.id
    }));

    return new Response(JSON.stringify({ cities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in search-cities:', error);
    return new Response(JSON.stringify({ error: error.message, cities: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
