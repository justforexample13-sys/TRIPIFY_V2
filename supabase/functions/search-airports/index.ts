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
    console.log('Searching airports via SerpApi for:', query);

    if (!query) {
      return new Response(JSON.stringify({ airports: [] }), {
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

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }

    const results = await response.json();
    const suggestions = results.suggestions || [];

    const airports = suggestions.map((item: any) => {
      const id = item.id || '';
      return {
        iata: id,
        name: item.title,
        city: item.subtitle ? item.subtitle.split(',')[0].trim() : item.title,
        country: item.subtitle ? item.subtitle.split(',').pop().trim() : '',
      };
    }).filter((a: any) => a.iata);

    return new Response(JSON.stringify({ airports }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in search-airports:', error);
    return new Response(JSON.stringify({ error: error.message, airports: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
