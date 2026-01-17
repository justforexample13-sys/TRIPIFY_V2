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
    const { from, to, departDate } = await req.json();
    console.log('Searching flights:', { from, to, departDate });

    const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY');
    if (!apiKey) {
      throw new Error('AVIATIONSTACK_API_KEY not configured');
    }

    const url = new URL('https://api.aviationstack.com/v1/flights');
    url.searchParams.set('access_key', apiKey);
    url.searchParams.set('limit', '20');
    if (from) url.searchParams.set('dep_iata', String(from).toUpperCase());
    if (to) url.searchParams.set('arr_iata', String(to).toUpperCase());
    if (departDate) url.searchParams.set('flight_date', String(departDate));

    console.log('Fetching from URL:', url.toString().replace(apiKey, '***'));

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('API error:', response.status, await response.text());
      throw new Error('Failed to fetch flights');
    }

    const data = await response.json();
    console.log('Flights API response count:', data.data?.length || 0);

    const flights = (data.data || []).map((flight: any, index: number) => ({
      id: index + 1,
      airline: flight.airline?.name || 'Unknown Airline',
      flightNumber: flight.flight?.iata || flight.flight?.number || 'N/A',
      departure: {
        time: flight.departure?.scheduled ? new Date(flight.departure.scheduled).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A',
        airport: flight.departure?.iata || from,
        city: flight.departure?.airport || 'Unknown',
        terminal: flight.departure?.terminal || '',
        gate: flight.departure?.gate || '',
      },
      arrival: {
        time: flight.arrival?.scheduled ? new Date(flight.arrival.scheduled).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A',
        airport: flight.arrival?.iata || to,
        city: flight.arrival?.airport || 'Unknown',
        terminal: flight.arrival?.terminal || '',
        gate: flight.arrival?.gate || '',
      },
      duration: calculateDuration(flight.departure?.scheduled, flight.arrival?.scheduled),
      status: flight.flight_status || 'scheduled',
      stops: 'Non-stop',
      price: Math.floor(Math.random() * 500) + 200, // Mock price since API doesn't provide it
      class: 'Economy',
    }));

    return new Response(JSON.stringify({ flights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in search-flights:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, flights: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateDuration(departure: string, arrival: string): string {
  if (!departure || !arrival) return 'N/A';
  
  try {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  } catch {
    return 'N/A';
  }
}
