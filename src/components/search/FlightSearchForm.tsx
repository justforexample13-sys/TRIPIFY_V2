import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Users,
  ArrowRightLeft,
  Search,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import AirportAutocomplete from "./AirportAutocomplete";
import { Airport } from "@/hooks/useAirportSearch";
import { useFlightDestinations } from "@/hooks/useFlightDestinations";
import { useFlightDates } from "@/hooks/useFlightDates";

type TripType = "roundtrip" | "oneway";

const FlightSearchForm = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [fromAirport, setFromAirport] = useState<Airport | null>(null);
  const [toAirport, setToAirport] = useState<Airport | null>(null);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState({ adults: 1, children: 0 });
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dependent Search Hooks
  const { destinations, searchDestinations } = useFlightDestinations();
  const { dates, searchDates } = useFlightDates();

  // Fetch suggested destinations when "From" changes
  useEffect(() => {
    if (fromAirport?.iata) {
      searchDestinations(fromAirport.iata);
    }
  }, [fromAirport, searchDestinations]);

  useEffect(() => {
    if (fromAirport?.iata && toAirport?.iata) {
      searchDates(fromAirport.iata, toAirport.iata);
    }
  }, [fromAirport?.iata, toAirport?.iata, searchDates]);

  // Fallback popular destinations if API fails or returns empty
  const popularFallbacks: Airport[] = [
    { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
    { iata: 'DXB', name: 'Dubai', city: 'Dubai', country: 'UAE' },
    { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
    { iata: 'JFK', name: 'New York', city: 'New York', country: 'USA' },
    { iata: 'BKK', name: 'Bangkok', city: 'Bangkok', country: 'Thailand' },
    { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },
  ].filter(d => d.iata !== fromAirport?.iata);

  const popularOrigins: Airport[] = [
    { iata: 'DXB', name: 'Dubai', city: 'Dubai', country: 'UAE' },
    { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
    { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
    { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },
    { iata: 'JFK', name: 'New York', city: 'New York', country: 'USA' },
    { iata: 'BKK', name: 'Bangkok', city: 'Bangkok', country: 'Thailand' },
  ];

  // Convert "Destinations" to "Airports" format for the autocomplete suggestions
  const apiSuggestions: Airport[] = destinations.map(d => ({
    iata: d.destination,
    name: `To ${d.destination}`,
    city: d.destination,
    country: ''
  }));

  const suggestedAirports = apiSuggestions.length > 0 ? apiSuggestions : popularFallbacks;

  const swapLocations = () => {
    const tempAirport = fromAirport;
    const tempValue = fromValue;
    setFromAirport(toAirport);
    setFromValue(toValue);
    setToAirport(tempAirport);
    setToValue(tempValue);
  };

  const handleSearch = () => {
    setFormError(null);

    if (!fromAirport?.iata || !toAirport?.iata || !departDate) {
      setFormError('Please select From, To, and a Departure date');
      return;
    }

    const params = new URLSearchParams();
    if (fromAirport?.iata) params.set('from', fromAirport.iata);
    if (toAirport?.iata) params.set('to', toAirport.iata);
    if (departDate) params.set('date', departDate.toISOString().split('T')[0]);
    if (tripType === 'roundtrip' && returnDate) {
      params.set('returnDate', returnDate.toISOString().split('T')[0]);
    }
    params.set('adults', passengers.adults.toString());
    params.set('children', passengers.children.toString());

    navigate(`/flights?${params.toString()}`);
  };

  // Check if a date has flight availability (if dates loaded)
  // If dates array is empty/failed, we don't disable anything to avoid blocking user.
  const isDateDisabled = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true; // Past dates

    // Note: API might not return ALL valid dates, only cheapest/some. 
    // So disabling based on strictly "not in list" might be too aggressive if the API is partial.
    // For now, let's just use it to Highlight, or only disable if we are SURE.
    // Better UI practice: Don't disable unless confirmed 'no flight'. 
    // Let's rely on standard 'disable past' for now, but potentially highlight cheap dates?
    return false;
  };

  // Custom modifiers for Calendar to highlight cheap dates?
  const cheapDateModifiers = {
    cheap: dates.map(d => new Date(d.departureDate))
  };

  const cheapDateStyles = {
    cheap: { color: 'var(--primary)', fontWeight: 'bold' }
  };

  return (
    <div className="space-y-4">
      {/* Trip Type Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setTripType("roundtrip")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tripType === "roundtrip"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Round Trip
        </button>
        <button
          onClick={() => setTripType("oneway")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tripType === "oneway"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          One Way
        </button>
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* From */}
        <div className="lg:col-span-3 relative">
          <AirportAutocomplete
            value={fromValue}
            onSelect={(airport) => {
              setFromAirport(airport);
              setFromValue(`${airport.city} (${airport.iata})`);
              setFormError(null);
            }}
            label="From"
            icon="plane"
            suggestedOptions={popularOrigins}
          />
        </div>

        {/* Swap Button */}
        <div className="lg:col-span-1 flex items-center justify-center">
          <button
            onClick={swapLocations}
            className="w-10 h-10 rounded-full bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all hover:scale-110"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To */}
        <div className="lg:col-span-3 relative">
          <AirportAutocomplete
            value={toValue}
            onSelect={(airport) => {
              setToAirport(airport);
              setToValue(`${airport.city} (${airport.iata})`);
              setFormError(null);
            }}
            label="To"
            icon="pin"
            suggestedOptions={suggestedAirports}
          />
        </div>

        {/* Departure Date */}
        <div className="lg:col-span-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full glass-input rounded-xl p-4 text-left focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" />
                  Departure
                </label>
                <div className="font-medium mt-1">
                  {departDate ? format(departDate, "MMM d, yyyy") : <span className="text-muted-foreground/50">Select date</span>}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <Calendar
                mode="single"
                selected={departDate}
                onSelect={setDepartDate}
                initialFocus
                className="bg-card"
                disabled={isDateDisabled}
                modifiers={cheapDateModifiers}
                modifiersStyles={cheapDateStyles as any}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Return Date */}
        {tripType === "roundtrip" && (
          <div className="lg:col-span-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full glass-input rounded-xl p-4 text-left focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" />
                    Return
                  </label>
                  <div className="font-medium mt-1">
                    {returnDate ? format(returnDate, "MMM d, yyyy") : <span className="text-muted-foreground/50">Select date</span>}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  initialFocus
                  className="bg-card"
                  disabled={(date) => date < (departDate || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Passengers */}
        <div className={cn("relative", tripType === "roundtrip" ? "lg:col-span-1" : "lg:col-span-3")}>
          <Popover open={isPassengerOpen} onOpenChange={setIsPassengerOpen}>
            <PopoverTrigger asChild>
              <button className="w-full glass-input rounded-xl p-4 text-left focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Travelers
                </label>
                <div className="font-medium mt-1 flex items-center gap-1">
                  {passengers.adults + passengers.children}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-card border-border p-4" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adults</p>
                    <p className="text-sm text-muted-foreground">12+ years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{passengers.adults}</span>
                    <button
                      onClick={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Children</p>
                    <p className="text-sm text-muted-foreground">2-11 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{passengers.children}</span>
                    <button
                      onClick={() => setPassengers(p => ({ ...p, children: p.children + 1 }))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="hero"
          size="xl"
          onClick={handleSearch}
          className="min-w-[200px]"
          disabled={!fromAirport?.iata || !toAirport?.iata || !departDate}
        >
          <Search className="w-5 h-5 mr-2" />
          Search Flights
        </Button>
      </div>

      {formError && (
        <div className="text-center text-sm text-destructive">{formError}</div>
      )}
    </div>
  );
};

export default FlightSearchForm;
