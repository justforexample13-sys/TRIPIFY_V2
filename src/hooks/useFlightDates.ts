import { useState, useCallback } from "react";

export interface FlightDate {
    type: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    price: {
        total: string;
    };
    links: any;
}

export const useFlightDates = () => {
    const [dates, setDates] = useState<FlightDate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchDates = useCallback(async (from: string, to: string) => {
        if (!from || !to) return;

        setIsLoading(true);
        setError(null);

        try {
            const url = new URL('/api/flights/dates', window.location.origin);
            url.searchParams.set('from', from);
            url.searchParams.set('to', to);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Failed to fetch dates');

            const json = await response.json();
            setDates(json.data || []);
        } catch (err) {
            console.error('Date search error:', err);
            setError('Failed to load availability');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { dates, isLoading, error, searchDates };
};
