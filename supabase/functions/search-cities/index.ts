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

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ cities: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    const apiHost = Deno.env.get('RAPIDAPI_HOST') || 'sky-scrapper.p.rapidapi.com';

    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // Use Skyscraper city/airport search API
    const response = await fetch(
      `https://${apiHost}/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        },
      }
    );

    if (!response.ok) {
      console.error('Skyscraper city search error:', response.status, await response.text());
      throw new Error('Failed to search cities');
    }

    const json = await response.json();

    const cities = (json.data || []).map((item: any) => ({
      code: item.skyId,
      name: item.presentation.title,
      country: item.presentation.subtitle.split(',').pop().trim(),
      countryName: item.presentation.subtitle.split(',').pop().trim(),
    }));

    return new Response(JSON.stringify({ cities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in search-cities:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, cities: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
