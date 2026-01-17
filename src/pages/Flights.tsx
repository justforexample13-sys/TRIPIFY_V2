import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import FlightSearchForm from "@/components/search/FlightSearchForm";
import { Button } from "@/components/ui/button";
import {
  Plane,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useFlightSearch, Flight } from "@/hooks/useFlightSearch";
import { useFlightDestinations } from "@/hooks/useFlightDestinations";

const Flights = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("price");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stops: [] as string[],
    minPrice: "",
    maxPrice: "",
    airlines: [] as string[],
  });

  const { flights, isLoading, error, searchFlights } = useFlightSearch();
  const {
    destinations,
    isLoading: isDestinationsLoading,
    error: destinationsError,
    searchDestinations,
  } = useFlightDestinations();

  // Auto-search on page load if params exist
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const returnDate = searchParams.get('returnDate');

    if (from && to && date) {
      searchFlights(from, to, new Date(date));
    } else if (!from && !to) {
      // Default live flights for demonstration/verification
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      searchFlights('LHR', 'JFK', tomorrow);
      searchDestinations('LHR', 500, 'USD');
    }

    if (from) {
      searchDestinations(from, 500, 'USD');
    }
  }, [searchParams]);

  // Filter and sort flights
  const filteredFlights = flights.filter(flight => {
    if (filters.stops.length > 0 && !filters.stops.includes(flight.stops)) {
      return false;
    }
    if (filters.minPrice && flight.price < parseInt(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && flight.price > parseInt(filters.maxPrice)) {
      return false;
    }
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    return 0;
  });

  const displayFlights = (!searchParams.get('from') && !searchParams.get('to'))
    ? filteredFlights.slice(0, 5)
    : filteredFlights;

  const uniqueAirlines = [...new Set(flights.map(f => f.airline))];

  const toggleFilter = (type: 'stops' | 'airlines', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const resetFilters = () => {
    setFilters({ stops: [], minPrice: "", maxPrice: "", airlines: [] });
  };

  return (
    <Layout>
      {/* Hero Search */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-center mb-8">
            Find Your <span className="gradient-text">Perfect Flight</span>
          </h1>
          <div className="max-w-5xl mx-auto glass-card p-6 lg:p-8">
            <FlightSearchForm />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:w-72 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div className="glass-card p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  <button onClick={resetFilters} className="text-sm text-primary hover:underline">
                    Reset
                  </button>
                </div>

                {/* Stops Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Stops</h4>
                  <div className="space-y-2">
                    {["Non-stop", "1 stop", "2+ stops"].map((stop) => (
                      <label key={stop} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={filters.stops.includes(stop)}
                          onChange={() => toggleFilter('stops', stop)}
                        />
                        <span className="text-sm text-muted-foreground">{stop}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Price Range</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="input-field py-2 text-sm"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="input-field py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Airlines */}
                {uniqueAirlines.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Airlines</h4>
                    <div className="space-y-2">
                      {uniqueAirlines.map((airline) => (
                        <label key={airline} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={filters.airlines.includes(airline)}
                            onChange={() => toggleFilter('airlines', airline)}
                          />
                          <span className="text-sm text-muted-foreground">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {/* Sort Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <button
                    className="lg:hidden btn-secondary py-2 px-4"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{displayFlights.length}</span> {(!searchParams.get('from') && !searchParams.get('to')) ? 'live featured flights found' : 'flights found'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <span className="text-sm font-medium">
                      {sortBy === "price" ? "Price" : sortBy === "duration" ? "Duration" : "Best"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Searching flights...</span>
                </div>
              )}

              {/* Destinations (Amadeus Flight Inspiration) */}
              <div className="mb-8">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h3 className="text-lg font-semibold">Popular Live Deals</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimated Prices (<span className="font-medium text-foreground">USD</span>)
                  </p>
                </div>

                {isDestinationsLoading && (
                  <div className="flex items-center gap-3 py-4 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading destinations...
                  </div>
                )}

                {destinationsError && (
                  <div className="py-4 text-sm text-destructive">
                    {destinationsError}
                  </div>
                )}

                {!isDestinationsLoading && !destinationsError && destinations.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {destinations.slice(0, 9).map((d) => (
                      <div key={d.id} className="glass-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">
                            {d.origin}
                            <span className="mx-2 text-muted-foreground">→</span>
                            {d.destination}
                          </div>
                          <div className="font-bold text-primary">
                            {Number.isFinite(d.priceTotal) ? d.priceTotal.toFixed(2) : '—'} {d.currency}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {d.departureDate}
                          {d.returnDate ? ` • ${d.returnDate}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isDestinationsLoading && !destinationsError && destinations.length === 0 && (
                  <div className="py-4 text-sm text-muted-foreground">
                    Enter an origin airport (e.g. PAR) to see inspiration destinations.
                  </div>
                )}
              </div>

              {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <p className="text-destructive">{error}</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && displayFlights.length === 0 && (
                <div className="text-center py-20">
                  <Plane className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No flights found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              )}

              {/* Flight Cards */}
              <div className="space-y-4">
                {displayFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSelect={() => navigate('/flights/details', { state: { flight } })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const FlightCard = ({ flight, onSelect }: { flight: Flight; onSelect: () => void }) => (
  <div className="glass-card p-6 card-hover">
    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
      {/* Airline Info */}
      <div className="flex items-center gap-4 lg:w-48">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Plane className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{flight.airline}</p>
          <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
        </div>
      </div>

      {/* Flight Times */}
      <div className="flex-1 flex items-center justify-between lg:justify-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{flight.departure.time}</p>
          <p className="text-sm text-muted-foreground">{flight.departure.airport}</p>
        </div>
        <div className="flex-1 max-w-[200px] flex flex-col items-center">
          <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
          <div className="w-full h-px bg-border relative">
            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{flight.stops}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{flight.arrival.time}</p>
          <p className="text-sm text-muted-foreground">{flight.arrival.airport}</p>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:w-40">
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">${flight.price}</p>
          <p className="text-sm text-muted-foreground">per person</p>
        </div>
        <Button variant="default" size="sm" onClick={onSelect}>
          Select
        </Button>
      </div>
    </div>
  </div>
);

export default Flights;
