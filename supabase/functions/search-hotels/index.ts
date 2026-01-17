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
    const { cityCode, checkInDate, checkOutDate, adults, rooms } = await req.json();
    console.log('Searching hotels via SerpApi:', { cityCode, checkInDate, checkOutDate, adults, rooms });

    if (!cityCode || !checkInDate || !checkOutDate) {
      return new Response(JSON.stringify({ hotels: [], error: 'Missing required params' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('SERPAPI_KEY');
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    const query = cityCode;

    const params = new URLSearchParams({
      engine: 'google_hotels',
      q: query,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: adults || '1',
      rooms: rooms || '1',
      currency: 'USD',
      gl: 'us',
      hl: 'en',
      api_key: apiKey
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }

    const results = await response.json();
    const properties = results.properties || [];

    const hotels = properties.map((prop: any, index: number) => {
      const priceTotal = prop.total_rate?.lowest?.replace(/[^0-9.]/g, '') ||
        prop.rate_per_night?.lowest?.replace(/[^0-9.]/g, '') || '0';

      return {
        id: index + 1,
        hotelId: prop.property_token || `serp-h-${index}`,
        name: prop.name,
        location: query,
        rating: prop.overall_rating || 0,
        reviews: prop.reviews || 0,
        price: parseFloat(priceTotal),
        currency: 'USD',
        amenities: prop.amenities || [],
        type: 'Hotel',
        image: prop.images?.[0]?.thumbnail || prop.thumbnail || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`
      };
    });

    return new Response(JSON.stringify({ hotels }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in search-hotels:', error);
    return new Response(JSON.stringify({ error: error.message, hotels: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
