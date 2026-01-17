import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";

export interface City {
  code: string;
  name: string;
  country: string;
  countryName: string;
}

export const useCitySearch = (query: string, debounceMs = 300) => {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");

  const searchCities = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setCities([]);
      return;
    }

    setLastQuery(searchQuery);
    setIsLoading(true);
    setError(null);

    try {
      const json = await apiCall('/api/flights/cities', { query: searchQuery });
      setCities(json.cities || []);
    } catch (err) {
      console.error('City search error:', err);
      setError('Failed to search cities');
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCities(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, searchCities]);

  return { cities, isLoading, error, lastQuery };
};
