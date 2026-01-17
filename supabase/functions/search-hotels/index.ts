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
    console.log('Searching hotels:', { cityCode, checkInDate, checkOutDate, adults, rooms });

    if (!cityCode) {
      return new Response(JSON.stringify({ hotels: [], error: 'City code or name is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    const apiHost = Deno.env.get('RAPIDAPI_HOST') || 'sky-scrapper.p.rapidapi.com';

    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // 1. Get Entity ID from City Code/Name
    console.log(`Searching hotel location for: ${cityCode}`);
    const destUrl = `https://${apiHost}/api/v1/hotels/searchDestinationOrHotel?query=${encodeURIComponent(cityCode)}`;

    const locationRes = await fetch(destUrl, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    });

    const locationJson = await locationRes.json();
    // Pick best match (CITY)
    const bestMatch = locationJson.data?.find((d: any) => d.entityType === 'CITY') || locationJson.data?.[0];

    if (!bestMatch) {
      return new Response(JSON.stringify({ hotels: [], error: 'Location not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const entityId = bestMatch.entityId;
    console.log(`Found entityId: ${entityId} for ${bestMatch.entityName}`);


    // 2. Search Hotels
    const hotelUrl = new URL(`https://${apiHost}/api/v1/hotels/searchHotels`);
    hotelUrl.searchParams.set('entityId', entityId);

    if (checkInDate) hotelUrl.searchParams.set('checkIn', checkInDate);
    if (checkOutDate) hotelUrl.searchParams.set('checkOut', checkOutDate);
    hotelUrl.searchParams.set('adults', adults || '1');
    hotelUrl.searchParams.set('rooms', rooms || '1');
    hotelUrl.searchParams.set('limit', '20');
    hotelUrl.searchParams.set('currency', 'USD');

    console.log('Fetching hotels from Skyscraper...');
    const hotelRes = await fetch(hotelUrl.toString(), {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    });

    if (!hotelRes.ok) {
      const text = await hotelRes.text();
      console.error('Hotel search error:', hotelRes.status, text);
      throw new Error('Failed to fetch hotels from provider');
    }

    const hotelJson = await hotelRes.json();
    const rawHotels = hotelJson.data?.hotels || [];

    // 3. Map to internal format
    const hotels = rawHotels.map((h: any, index: number) => ({
      id: index + 1,
      hotelId: h.hotelId,
      name: h.name,
      location: bestMatch.entityName,
      rating: h.stars || 0,
      reviews: h.reviewCount || 0,
      price: h.price ? parseFloat(String(h.price).replace(/[^0-9.]/g, '')) : 0,
      currency: 'USD',
      amenities: ['WIFI'], // API specific mapping needed if available
      type: 'Hotel',
      image: h.heroImage || `https://images.unsplash.com/photo-${['1566073771259-6a8506099945', '1551882547-ff40c63fe5fa'][index % 2]}?w=800&q=80`
    }));

    console.log(`Returning ${hotels.length} hotels`);

    return new Response(JSON.stringify({ hotels }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in search-hotels:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, hotels: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
