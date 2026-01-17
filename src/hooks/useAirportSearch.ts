import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export const useAirportSearch = (query: string) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAirports = async () => {
      if (!query || query.length < 2) {
        setAirports([]);
        return;
      }

      setIsLoading(true);
      try {
        const json = await apiCall('/api/flights/airports', { search: query });

        // Amadeus Locations API response structure
        const mapped = (json.data || json.airports || []).map((item: any) => ({
          iata: item.iataCode || item.iata,
          name: item.name,
          city: item.address?.cityName || item.city || item.name,
          country: item.address?.countryName || item.country || '',
        }));

        setAirports(mapped);
      } catch (error) {
        console.error("Airport search error:", error);
        setAirports([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchAirports, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { airports, isLoading };
};
