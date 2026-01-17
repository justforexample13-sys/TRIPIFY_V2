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
    console.log('Searching cities for:', query);

    if (!query || query.length < 1) {
      return new Response(JSON.stringify({ cities: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('SERPAPI_KEY');
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    const params = new URLSearchParams({
      engine: 'google_flights_autocomplete',
      q: query,
      api_key: apiKey,
      hl: 'en',
      gl: 'us'
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }

    const results = await response.json();
    const suggestions = results.suggestions || [];

    const cities = suggestions
      .filter((item: any) => item.id && item.id.length === 3)
      .map((item: any) => ({
        code: item.id,
        name: item.title,
        country: item.subtitle,
        countryName: item.subtitle,
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
