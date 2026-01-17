import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  Users, 
  Search,
  ChevronDown,
  DoorOpen
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import CityAutocomplete from "./CityAutocomplete";
import { City } from "@/hooks/useCitySearch";

const HotelSearchForm = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [destinationValue, setDestinationValue] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSearch = () => {
    setFormError(null);

    if (!selectedCity?.code) {
      setFormError('Please select a destination from the list');
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      setFormError('Please select check-in and check-out dates');
      return;
    }

    const params = new URLSearchParams();
    if (selectedCity?.code) params.set('city', selectedCity.code);
    if (dateRange?.from) params.set('checkIn', dateRange.from.toISOString().split('T')[0]);
    if (dateRange?.to) params.set('checkOut', dateRange.to.toISOString().split('T')[0]);
    params.set('adults', guests.adults.toString());
    params.set('rooms', rooms.toString());
    
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Destination */}
        <div className="lg:col-span-4 relative">
          <CityAutocomplete
            value={destinationValue}
            onInputChange={(val) => {
              setDestinationValue(val);
              setSelectedCity(null);
              setFormError(null);
            }}
            onSelect={(city) => {
              setSelectedCity(city);
              setDestinationValue(`${city.name}, ${city.countryName || city.country}`);
              setFormError(null);
            }}
            label="Destination"
          />
        </div>

        {/* Check-in / Check-out */}
        <div className="lg:col-span-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full glass-input rounded-xl p-4 text-left focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" />
                  Check-in — Check-out
                </label>
                <div className="font-medium mt-1">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} — {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span className="text-muted-foreground/50">Select dates</span>
                  )}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="bg-card"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Rooms */}
        <div className="lg:col-span-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full glass-input rounded-xl p-4 text-left focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <DoorOpen className="w-3 h-3" />
                  Rooms
                </label>
                <div className="font-medium mt-1 flex items-center gap-1">
                  {rooms} Room{rooms > 1 ? "s" : ""}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-card border-border p-4" align="start">
              <div className="flex items-center justify-between">
                <span className="font-medium">Rooms</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRooms(r => Math.max(1, r - 1))}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{rooms}</span>
                  <button
                    onClick={() => setRooms(r => r + 1)}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="lg:col-span-2">
          <Popover open={isGuestOpen} onOpenChange={setIsGuestOpen}>
            <PopoverTrigger asChild>
              <button className="w-full glass-input rounded-xl p-4 text-left focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Guests
                </label>
                <div className="font-medium mt-1 flex items-center gap-1">
                  {guests.adults + guests.children}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-card border-border p-4" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adults</p>
                    <p className="text-sm text-muted-foreground">18+ years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{guests.adults}</span>
                    <button
                      onClick={() => setGuests(g => ({ ...g, adults: g.adults + 1 }))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Children</p>
                    <p className="text-sm text-muted-foreground">0-17 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(g => ({ ...g, children: Math.max(0, g.children - 1) }))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{guests.children}</span>
                    <button
                      onClick={() => setGuests(g => ({ ...g, children: g.children + 1 }))}
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
          disabled={!selectedCity?.code || !dateRange?.from || !dateRange?.to}
        >
          <Search className="w-5 h-5 mr-2" />
          Search Hotels
        </Button>
      </div>

      {formError && (
        <div className="text-center text-sm text-destructive">{formError}</div>
      )}
    </div>
  );
};

export default HotelSearchForm;
