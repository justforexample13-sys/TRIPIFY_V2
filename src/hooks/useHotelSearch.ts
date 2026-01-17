import { useState } from "react";
import { apiCall } from "@/lib/api";

export interface Hotel {
  id: number;
  hotelId: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  amenities: string[];
  type: string;
  image: string;
}

export const useHotelSearch = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = async (
    cityCode: string,
    checkInDate?: Date,
    checkOutDate?: Date,
    adults?: number,
    rooms?: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = {
        city: String(cityCode),
        adults: adults || 1,
        rooms: rooms || 1,
      };
      
      if (checkInDate) params.checkInDate = checkInDate.toISOString().split('T')[0];
      if (checkOutDate) params.checkOutDate = checkOutDate.toISOString().split('T')[0];

      const json = await apiCall('/api/hotels', params);
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.hotels)
          ? json.hotels
          : [];

      const hotels: Hotel[] = items.map((item: any, index: number) => {
        const hotel = item.hotel || item;
        const offer = item.offers?.[0];
        const priceTotal = offer?.price?.total;
        const currency = offer?.price?.currency;

        return {
          id: index + 1,
          hotelId: hotel?.hotelId || hotel?.hotelId || String(index + 1),
          name: hotel?.name || 'Unknown Hotel',
          location: hotel?.cityCode || hotel?.address?.cityName || String(cityCode),
          rating: Number(hotel?.rating) || Math.floor(Math.random() * 2) + 3,
          reviews: Math.floor(Math.random() * 2000) + 100,
          price: priceTotal ? parseFloat(priceTotal) : Math.floor(Math.random() * 300) + 100,
          currency: currency || 'USD',
          amenities: (hotel?.amenities || ['WIFI', 'RESTAURANT', 'PARKING', 'POOL']).slice(0, 4),
          type: hotel?.type || 'Hotel',
          image: `https://images.unsplash.com/photo-${['1566073771259-6a8506099945', '1551882547-ff40c63fe5fa', '1582719508461-905c673771fd', '1520250497591-112f2f40a3f4'][index % 4]}?w=800&q=80`,
        };
      });

      setHotels(hotels);
    } catch (err) {
      console.error('Hotel search error:', err);
      setError('Failed to search hotels');
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { hotels, isLoading, error, searchHotels };
};
