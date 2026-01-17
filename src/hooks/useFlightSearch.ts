import { useState } from "react";
import { apiCall } from "@/lib/api";

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    time: string;
    airport: string;
    city: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    time: string;
    airport: string;
    city: string;
    terminal?: string;
    gate?: string;
  };
  duration: string;
  stops: string;
  price: number;
  class: string;
}

export const useFlightSearch = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = async (from: string, to: string, departDate?: Date, returnDate?: Date) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        from: String(from).toUpperCase(),
        to: String(to).toUpperCase(),
      };
      
      if (departDate) {
        const yyyy = departDate.getFullYear();
        const mm = String(departDate.getMonth() + 1).padStart(2, '0');
        const dd = String(departDate.getDate()).padStart(2, '0');
        params.date = `${yyyy}-${mm}-${dd}`;
      }

      if (returnDate) {
        const yyyy = returnDate.getFullYear();
        const mm = String(returnDate.getMonth() + 1).padStart(2, '0');
        const dd = String(returnDate.getDate()).padStart(2, '0');
        params.returnDate = `${yyyy}-${mm}-${dd}`;
      }

      const json = await apiCall('/api/flights/offers', params);
      // Parse Amadeus Flight Offers Response

      // Parse Amadeus Flight Offers Response
      // content.data[] contains offers
      // content.dictionaries contains reference data (airlines, aircraft, locations)

      const dictionaries = json.dictionaries || {};
      const carriers = dictionaries.carriers || {};
      const locations = dictionaries.locations || {};

      const parsedFlights: Flight[] = (json.data || []).map((offer: any) => {
        const itinerary = offer.itineraries?.[0]; // Taking first itinerary (outbound)
        if (!itinerary) return null;

        const segments = itinerary.segments;
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        // Airline Name
        const carrierCode = firstSegment.carrierCode;
        const airlineName = carriers[carrierCode] || carrierCode;

        // Locations
        const depIata = firstSegment.departure.iataCode;
        const arrIata = lastSegment.arrival.iataCode;
        // Try to look up city code/name in dictionaries, otherwise fallback to IATA
        const depCity = locations[depIata]?.cityCode || depIata;
        const arrCity = locations[arrIata]?.cityCode || arrIata;

        // Times
        const depTimeFull = firstSegment.departure.at; // ISO string
        const arrTimeFull = lastSegment.arrival.at;   // ISO string

        const formatTime = (iso: string) => {
          if (!iso) return 'N/A';
          const d = new Date(iso);
          return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        };

        // Duration (PT2H30M format)
        const durationIso = itinerary.duration; // e.g. PT2H
        const duration = durationIso.replace('PT', '').toLowerCase();

        // Stops
        const stopCount = segments.length - 1;
        const stopsLabel = stopCount === 0 ? 'Non-stop' : `${stopCount} stop${stopCount > 1 ? 's' : ''}`;

        return {
          id: offer.id,
          airline: airlineName,
          flightNumber: `${carrierCode}${firstSegment.number}`,
          departure: {
            time: formatTime(depTimeFull),
            airport: depIata,
            city: depCity,
            terminal: firstSegment.departure.terminal,
          },
          arrival: {
            time: formatTime(arrTimeFull),
            airport: arrIata,
            city: arrCity,
            terminal: lastSegment.arrival.terminal,
          },
          duration: duration,
          stops: stopsLabel,
          price: parseFloat(offer.price?.total || '0'),
          class: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'Economy',
          status: 'Available'
        };
      }).filter(Boolean); // Remove nulls

      setFlights(parsedFlights);
    } catch (err: any) {
      console.error('Flight search error:', err);
      setError(err.message || 'Failed to search flights');
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { flights, isLoading, error, searchFlights };
};
