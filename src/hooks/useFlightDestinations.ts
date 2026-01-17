import { useState, useCallback } from "react";
import { apiCall } from "@/lib/api";

export interface FlightDestination {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  priceTotal: number;
  currency: string;
}

export const useFlightDestinations = () => {
  const [destinations, setDestinations] = useState<FlightDestination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDestinations = useCallback(async (origin: string, maxPrice?: number, currency?: string) => {
    if (!origin) return;
    setIsLoading(true);
    setError(null);

    try {
      const json = await apiCall('/api/flights/destinations', {
        origin: String(origin).toUpperCase(),
        maxPrice,
      });
      const rawData = json.data || [];

      // Map Amadeus Flight Destination format
      const mapped = rawData.map((item: any, idx: number) => ({
        id: `dest-${idx}`,
        origin: item.origin,
        destination: item.destination,
        departureDate: item.departureDate,
        returnDate: item.returnDate,
        priceTotal: parseFloat(item.price?.total || '0'),
        currency: 'EUR' // Flight Inspiration often defaults based on origin, or we can check item.currency if available (often not in this specific lightweight endpoint response in some versions, but 'total' is usually there)
      }));

      setDestinations(mapped);
    } catch (err) {
      console.error('Destination search error:', err);
      setError('Failed to fetch destinations');
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { destinations, isLoading, error, searchDestinations };
};
