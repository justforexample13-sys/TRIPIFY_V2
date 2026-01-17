import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Searching airports for:', query);
    
    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ airports: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY');
    if (!apiKey) {
      throw new Error('AVIATIONSTACK_API_KEY not configured');
    }

    // Search airports using aviationstack API
    const response = await fetch(
      `http://api.aviationstack.com/v1/airports?access_key=${apiKey}&search=${encodeURIComponent(query)}&limit=10`
    );

    if (!response.ok) {
      console.error('API error:', response.status, await response.text());
      throw new Error('Failed to fetch airports');
    }

    const data = await response.json();
    console.log('Airports API response:', JSON.stringify(data).substring(0, 500));

    const airports = (data.data || []).map((airport: any) => ({
      iata: airport.iata_code,
      name: airport.airport_name,
      city: airport.municipality || airport.city || airport.airport_name,
      country: airport.country_name,
    })).filter((a: any) => a.iata);

    return new Response(JSON.stringify({ airports }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in search-airports:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, airports: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
