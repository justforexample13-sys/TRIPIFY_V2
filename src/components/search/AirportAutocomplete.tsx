import { useState, useRef, useEffect } from "react";
import { Plane, MapPin, Loader2 } from "lucide-react";
import { useAirportSearch, Airport } from "@/hooks/useAirportSearch";
import { cn } from "@/lib/utils";

interface AirportAutocompleteProps {
  value: string;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  label: string;
  icon?: "plane" | "pin";
  suggestedOptions?: Airport[]; // New prop for dependent suggestions
  autoFocus?: boolean;
}

const AirportAutocomplete = ({
  value,
  onSelect,
  placeholder = "City or Airport",
  label,
  icon = "plane",
  suggestedOptions = [],
  autoFocus = false
}: AirportAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { airports, isLoading } = useAirportSearch(inputValue);

  // Combine search results with suggested options
  const displayOptions = (() => {
    // If input is empty, show the suggested options (popular origins/destinations)
    if (inputValue.length === 0) return suggestedOptions;

    // Convert current search results (from API) into the Airport interface
    // Note: the backend now returns many results, some might already be in suggestedOptions

    const localMatches = suggestedOptions.filter(o =>
      o.city.toLowerCase().includes(inputValue.toLowerCase()) ||
      o.iata.toLowerCase().includes(inputValue.toLowerCase()) ||
      o.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    // De-duplicate API results from local matches by IATA code
    // Prioritize local matches at the top
    const apiMatches = airports.filter(api =>
      !localMatches.find(l => l.iata === api.iata || (l.name === api.name && l.city === api.city))
    );

    return [...localMatches, ...apiMatches];
  })();

  const showPopularHeader = inputValue.length === 0 && suggestedOptions.length > 0;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    setInputValue(`${airport.city} (${airport.iata})`);
    onSelect(airport);
    setIsOpen(false);
  };

  const Icon = icon === "plane" ? Plane : MapPin;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="glass-input rounded-xl p-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Icon className="w-3 h-3" />
          {label}
        </label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-foreground font-medium focus:outline-none placeholder:text-muted-foreground/50"
            autoFocus={autoFocus}
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && displayOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
          {inputValue.length < 2 && suggestedOptions.length > 0 && (
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
              Popular Destinations
            </div>
          )}
          <div className="max-h-64 overflow-y-auto">
            {displayOptions.map((airport, index) => (
              <button
                key={`${airport.iata}-${index}`}
                onClick={() => handleSelect(airport)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                  "flex items-center gap-3 border-b border-border/50 last:border-0"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Plane className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {airport.city}, {airport.country}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {airport.name} ({airport.iata})
                  </p>
                </div>
                <span className="text-lg font-bold text-primary shrink-0">
                  {airport.iata}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
