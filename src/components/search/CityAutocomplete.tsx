import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useCitySearch, City } from "@/hooks/useCitySearch";
import { cn } from "@/lib/utils";

interface CityAutocompleteProps {
  value: string;
  onSelect: (city: City) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  label: string;
}

const CityAutocomplete = ({
  value,
  onSelect,
  onInputChange,
  placeholder = "City, hotel, or landmark",
  label,
}: CityAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const { cities, isLoading } = useCitySearch(inputValue);

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

  const handleSelect = (city: City) => {
    setInputValue(`${city.name}, ${city.countryName || city.country}`);
    onSelect(city);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="glass-input rounded-xl p-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          {label}
        </label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              const next = e.target.value;
              setInputValue(next);
              onInputChange?.(next);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-foreground font-medium focus:outline-none placeholder:text-muted-foreground/50"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && cities.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {cities.map((city) => (
              <button
                key={`${city.code}-${city.country || city.countryName || ''}-${city.name}`}
                onClick={() => handleSelect(city)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                  "flex items-center gap-3 border-b border-border/50 last:border-0"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {city.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {city.countryName || city.country}
                  </p>
                </div>
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  {city.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
