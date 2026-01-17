import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HotelSearchForm from "@/components/search/HotelSearchForm";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Heart,
  Loader2,
  Hotel as HotelIcon
} from "lucide-react";
import { useHotelSearch, Hotel } from "@/hooks/useHotelSearch";

const Hotels = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    starRating: 0,
    amenities: [] as string[],
  });

  const { hotels, isLoading, error, searchHotels } = useHotelSearch();

  // Auto-search on page load if params exist
  useEffect(() => {
    const city = searchParams.get('city');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = searchParams.get('adults');
    const rooms = searchParams.get('rooms');

    if (city && checkIn && checkOut) {
      searchHotels(
        city,
        checkIn ? new Date(checkIn) : undefined,
        checkOut ? new Date(checkOut) : undefined,
        adults ? parseInt(adults) : 1,
        rooms ? parseInt(rooms) : 1
      );
    } else if (!city) {
      // Default live hotels for demonstration/verification
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 7);
      const checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + 10);
      searchHotels('NYC', checkInDate, checkOutDate, 1, 1);
    }
  }, [searchParams]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Filter hotels
  const filteredHotels = hotels.filter(hotel => {
    if (filters.minPrice && hotel.price < parseInt(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && hotel.price > parseInt(filters.maxPrice)) {
      return false;
    }
    if (filters.starRating > 0 && hotel.rating < filters.starRating) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const displayHotels = !searchParams.get('city')
    ? filteredHotels.slice(0, 5)
    : filteredHotels;

  const resetFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", starRating: 0, amenities: [] });
  };

  const amenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return Wifi;
    if (lower.includes('parking') || lower.includes('car')) return Car;
    if (lower.includes('restaurant') || lower.includes('breakfast')) return Coffee;
    return Wifi;
  };

  return (
    <Layout>
      {/* Hero Search */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=2400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-center mb-8">
            Find Your <span className="gradient-text">Perfect Stay</span>
          </h1>
          <div className="max-w-5xl mx-auto glass-card p-6 lg:p-8">
            <HotelSearchForm />
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

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Price per night</h4>
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

                {/* Star Rating */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Star Rating</h4>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3, 2].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          starRating: prev.starRating === stars ? 0 : stars
                        }))}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${filters.starRating === stars
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-primary/10 hover:text-primary'
                          }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {stars}+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Amenities</h4>
                  <div className="space-y-2">
                    {[
                      { icon: Wifi, label: "Free WiFi" },
                      { icon: Car, label: "Parking" },
                      { icon: Coffee, label: "Restaurant" },
                    ].map(({ icon: Icon, label }) => (
                      <label key={label} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="rounded border-border" />
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                    <span className="font-medium text-foreground">{displayHotels.length}</span> {!searchParams.get('city') ? 'live featured hotels found' : 'hotels found'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <button
                    onClick={() => setSortBy(s => s === 'price' ? 'rating' : 'price')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {sortBy === 'price' ? 'Price' : sortBy === 'rating' ? 'Rating' : 'Recommended'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Searching hotels...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <p className="text-destructive">{error}</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && displayHotels.length === 0 && (
                <div className="text-center py-20">
                  <HotelIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No hotels found</h3>
                  <p className="text-muted-foreground">Try searching for a destination above</p>
                </div>
              )}

              {/* Hotel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    isFavorite={favorites.includes(hotel.id)}
                    onToggleFavorite={() => toggleFavorite(hotel.id)}
                    amenityIcon={amenityIcon}
                    onViewDetails={() => navigate('/hotels/details', { state: { hotel } })}
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

const HotelCard = ({
  hotel,
  isFavorite,
  onToggleFavorite,
  amenityIcon,
  onViewDetails
}: {
  hotel: Hotel;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  amenityIcon: (amenity: string) => typeof Wifi;
  onViewDetails: () => void;
}) => (
  <div className="glass-card overflow-hidden card-hover">
    {/* Image */}
    <div className="relative h-48">
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
        {hotel.type}
      </div>
      <button
        onClick={onToggleFavorite}
        className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isFavorite
          ? "bg-destructive text-destructive-foreground"
          : "bg-background/80 backdrop-blur-sm text-foreground hover:text-destructive"
          }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>
    </div>

    {/* Content */}
    <div className="p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-lg leading-tight">
          {hotel.name}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="font-medium">{hotel.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({hotel.reviews})
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <MapPin className="w-4 h-4" />
        {hotel.location}
      </div>

      {/* Amenities */}
      <div className="flex items-center gap-2 mb-4">
        {hotel.amenities.slice(0, 4).map((amenity, idx) => {
          const Icon = amenityIcon(amenity);
          return (
            <div
              key={idx}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
              title={amenity}
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
          );
        })}
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-primary">
            ${hotel.price}
          </span>
          <span className="text-sm text-muted-foreground">
            /night
          </span>
        </div>
        <Button variant="default" size="sm" onClick={onViewDetails}>
          View Details
        </Button>
      </div>
    </div>
  </div>
);

export default Hotels;
