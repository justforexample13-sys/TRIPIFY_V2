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
    const { from, to, departDate, returnDate, adults, travelClass } = await req.json();
    console.log('Searching flights via SerpApi:', { from, to, departDate });

    if (!from || !to || !departDate) {
      return new Response(JSON.stringify({ flights: [], error: 'Missing required params' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('SERPAPI_KEY');
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id: from.toUpperCase(),
      arrival_id: to.toUpperCase(),
      outbound_date: departDate,
      currency: 'USD',
      hl: 'en',
      gl: 'us',
      api_key: apiKey,
      type: returnDate ? '1' : '2',
      adults: adults || '1',
    });

    if (returnDate) {
      params.set('return_date', returnDate);
    }

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }

    const results = await response.json();
    const allFlights = [
      ...(results.best_flights || []),
      ...(results.other_flights || [])
    ];

    const flights = allFlights.map((flight: any, index: number) => {
      const seg = flight.flights?.[0] || {};
      return {
        id: index + 1,
        airline: seg.airline || 'Unknown Airline',
        flightNumber: seg.flight_number || 'N/A',
        departure: {
          time: seg.departure_airport?.time || 'N/A',
          airport: seg.departure_airport?.id || from,
          city: seg.departure_airport?.name || 'Unknown',
        },
        arrival: {
          time: seg.arrival_airport?.time || 'N/A',
          airport: seg.arrival_airport?.id || to,
          city: seg.arrival_airport?.name || 'Unknown',
        },
        duration: flight.total_duration ? `${Math.floor(flight.total_duration / 60)}h ${flight.total_duration % 60}m` : 'N/A',
        status: 'scheduled',
        stops: flight.extensions?.find((e: string) => e.includes('stop')) || 'Non-stop',
        price: flight.price || 0,
        class: travelClass || 'Economy',
      };
    });

    return new Response(JSON.stringify({ flights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in search-flights:', error);
    return new Response(JSON.stringify({ error: error.message, flights: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
