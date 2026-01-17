import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plane, Hotel as HotelIcon, MapPin, Calendar, Star, ArrowRight } from "lucide-react";

type FlightDeal = {
  id: string;
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  priceTotal?: number;
  currency?: string;
};

type HotelDeal = {
  id: string;
  name: string;
  hotelId?: string;
  priceTotal?: number;
  currency?: string;
  cityCode?: string;
};

const flightImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=600&q=80",
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
  "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=600&q=80",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&q=80",
];

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
];

const featuredDeals = [
  {
    id: 1,
    title: "Maldives Paradise",
    subtitle: "7 nights all-inclusive",
    discount: "40% OFF",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    type: "Hotels",
  },
  {
    id: 2,
    title: "European Explorer",
    subtitle: "Multi-city flights",
    discount: "Save $300",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    type: "Flights",
  },
  {
    id: 3,
    title: "Caribbean Escape",
    subtitle: "Beach resort package",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80",
    type: "Hotels",
  },
];

function toNumber(v: any): number | undefined {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}

const Deals = () => {
  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "packages">("packages");

  const [flightOrigin, setFlightOrigin] = useState("DXB");
  const [flightMaxPrice, setFlightMaxPrice] = useState("500");

  const [hotelCity, setHotelCity] = useState("London");
  const [hotelCheckIn, setHotelCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [hotelCheckOut, setHotelCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 17);
    return d.toISOString().split('T')[0];
  });

  const [flightDeals, setFlightDeals] = useState<FlightDeal[]>([]);
  const [hotelDeals, setHotelDeals] = useState<HotelDeal[]>([]);
  const [packageDeals, setPackageDeals] = useState<any[]>([]);

  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  const [flightError, setFlightError] = useState<string | null>(null);
  const [hotelError, setHotelError] = useState<string | null>(null);

  const canSearchFlights = useMemo(() => flightOrigin.length >= 3, [flightOrigin]);
  const canSearchHotels = useMemo(() => {
    return !!hotelCity.trim() && !!hotelCheckIn.trim() && !!hotelCheckOut.trim();
  }, [hotelCity, hotelCheckIn, hotelCheckOut]);

  const fetchFlightDeals = async () => {
    setIsLoadingFlights(true);
    setFlightError(null);
    try {
      const url = new URL("/api/deals/flights", window.location.origin);
      url.searchParams.set("origin", flightOrigin.trim().toUpperCase());
      if (flightMaxPrice.trim()) url.searchParams.set("maxPrice", flightMaxPrice.trim());

      const res = await fetch(url.toString());
      const json = await res.json();

      const deals: FlightDeal[] = (json?.data || []).map((d: any, idx: number) => ({
        id: String(d?.id || `${d?.origin}-${d?.destination}-${idx}`),
        origin: d?.origin,
        destination: d?.destination,
        departureDate: d?.departureDate,
        priceTotal: toNumber(d?.price?.total),
        currency: d?.price?.currency,
      }));
      setFlightDeals(deals);
      return deals;
    } catch (e: any) {
      setFlightDeals([]);
      setFlightError("Failed to load flight deals");
      return [];
    } finally {
      setIsLoadingFlights(false);
    }
  };

  const fetchHotelDeals = async (city?: string) => {
    setIsLoadingHotels(true);
    setHotelError(null);
    try {
      const url = new URL("/api/deals/hotels", window.location.origin);
      url.searchParams.set("city", city || hotelCity.trim());
      url.searchParams.set("checkInDate", hotelCheckIn);
      url.searchParams.set("checkOutDate", hotelCheckOut);

      const res = await fetch(url.toString());
      const json = await res.json();

      const deals: HotelDeal[] = (json?.data || []).slice(0, 12).map((item: any, idx: number) => {
        const hotel = item?.hotel || item;
        const offer = item?.offers?.[0];
        return {
          id: String(item?.id || hotel?.hotelId || idx),
          hotelId: hotel?.hotelId,
          name: hotel?.name || "Hotel",
          cityCode: hotel?.cityCode,
          priceTotal: toNumber(offer?.price?.total),
          currency: offer?.price?.currency,
        };
      });

      setHotelDeals(deals);
      return deals;
    } catch (e: any) {
      setHotelDeals([]);
      setHotelError("Failed to load hotel deals");
      return [];
    } finally {
      setIsLoadingHotels(false);
    }
  };

  const fetchPackageDeals = async () => {
    setIsLoadingPackages(true);
    try {
      const flights = await fetchFlightDeals();
      if (flights.length > 0) {
        // Create packages from the flights we found
        const packages = await Promise.all(flights.slice(0, 3).map(async (flight) => {
          const hotels = await fetchHotelDeals(flight.destination);
          const topHotel = hotels[0];
          if (topHotel) {
            return {
              id: `pkg-${flight.id}-${topHotel.id}`,
              flight,
              hotel: topHotel,
              totalPrice: (flight.priceTotal || 0) + (topHotel.priceTotal || 0) * 3, // 3 nights
              destination: flight.destination
            };
          }
          return null;
        }));
        setPackageDeals(packages.filter(p => p !== null));
      }
    } catch (err) {
      console.error("Packaged deals error:", err);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'packages') fetchPackageDeals();
    else if (activeTab === 'flights') fetchFlightDeals();
    else if (activeTab === 'hotels') fetchHotelDeals();
  }, [activeTab]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
            alt="Travel deals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Exclusive <span className="gradient-text">Travel Deals</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover incredible savings on flights, hotels, and combined packages. Verified limited-time offers.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Deals Row */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold mb-8 flex items-center gap-3">
            <Star className="w-8 h-8 text-primary fill-primary" />
            Top Featured Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDeals.map((deal, index) => (
              <div
                key={deal.id}
                className="group relative overflow-hidden rounded-2xl aspect-[16/9] card-hover animate-fade-in shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                  {deal.discount}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="text-xs uppercase tracking-widest text-primary font-bold">{deal.type}</span>
                  <h3 className="text-2xl font-bold mt-1">{deal.title}</h3>
                  <p className="text-gray-300 text-sm">{deal.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Results Section */}
      <section className="py-12 lg:py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto glass-card p-6 lg:p-8 shadow-inner border border-white/5">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full mb-8 bg-background/50 p-1 h-auto grid grid-cols-3 rounded-xl border border-border/50">
                <TabsTrigger value="packages" className="py-3 gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Star className="w-4 h-4" />
                  Vacation Packages
                </TabsTrigger>
                <TabsTrigger value="flights" className="py-3 gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Plane className="w-4 h-4" />
                  Flight Deals
                </TabsTrigger>
                <TabsTrigger value="hotels" className="py-3 gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <HotelIcon className="w-4 h-4" />
                  Hotel Deals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="packages" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoadingPackages ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
                    ))
                  ) : packageDeals.length > 0 ? (
                    packageDeals.map((p, idx) => (
                      <Card key={p.id} className="overflow-hidden border-none shadow-elevated group">
                        <div className="relative h-48">
                          <img
                            src={flightImages[idx % flightImages.length]}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                            PACKAGE DEAL
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {p.destination}
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                              <Plane className="w-4 h-4 text-primary" />
                              <span>Round-trip from {p.flight.origin}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <HotelIcon className="w-4 h-4 text-primary" />
                              <span className="truncate">{p.hotel.name} (3 Nights)</span>
                            </div>
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">From</p>
                                <p className="text-2xl font-bold text-primary">${p.totalPrice.toFixed(0)}</p>
                              </div>
                              <Button size="sm">Select Package</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Creating customized packages for you...</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="flights" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">Departure Airport (IATA Code)</label>
                    <Input value={flightOrigin} onChange={(e) => setFlightOrigin(e.target.value)} placeholder="DXB" className="rounded-xl h-12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">Budget Limit (USD)</label>
                    <Input value={flightMaxPrice} onChange={(e) => setFlightMaxPrice(e.target.value)} placeholder="500" className="rounded-xl h-12" />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full h-12 rounded-xl font-bold" disabled={!canSearchFlights || isLoadingFlights} onClick={fetchFlightDeals}>
                      {isLoadingFlights ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Results"}
                    </Button>
                  </div>
                </div>

                {flightError && <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">{flightError}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {flightDeals.map((d, idx) => (
                    <Card key={d.id} className="overflow-hidden group card-hover border-none shadow-lg">
                      <div className="relative h-40">
                        <img
                          src={flightImages[idx % flightImages.length]}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <Plane className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Limited Offer</span>
                          </div>
                          <p className="text-lg font-bold">{d.origin} <ArrowRight className="inline w-4 h-4 mx-1" /> {d.destination}</p>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {d.departureDate || "Next 30 Days"}
                            </div>
                            <p className="text-xs text-muted-foreground">One-way Flight</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-primary">${d.priceTotal?.toFixed(0) || "---"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!isLoadingFlights && flightDeals.length === 0 && !flightError && (
                    <div className="col-span-full text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                      <Plane className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">Try a different departure city to see available deals.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="hotels" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                  <div className="md:col-span-5">
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">Destination City</label>
                    <Input value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} placeholder="Dubai" className="rounded-xl h-12" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">Check-in</label>
                    <Input value={hotelCheckIn} onChange={(e) => setHotelCheckIn(e.target.value)} type="date" className="rounded-xl h-12" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">Check-out</label>
                    <Input value={hotelCheckOut} onChange={(e) => setHotelCheckOut(e.target.value)} type="date" className="rounded-xl h-12" />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <Button className="w-full h-12 rounded-xl font-bold" disabled={!canSearchHotels || isLoadingHotels} onClick={() => fetchHotelDeals()}>
                      {isLoadingHotels ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search Hotels"}
                    </Button>
                  </div>
                </div>

                {hotelError && <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">{hotelError}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotelDeals.map((d, idx) => (
                    <Card key={d.id} className="overflow-hidden group card-hover border-none shadow-lg">
                      <div className="relative h-48">
                        <img
                          src={hotelImages[idx % hotelImages.length]}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-black text-xs font-bold shadow-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span>Top Rated</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors truncate">{d.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            {d.cityCode}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground line-through opacity-50 font-medium">${(toNumber(d.priceTotal) || 0 * 1.4).toFixed(0)}</p>
                            <p className="text-2xl font-black text-primary">${d.priceTotal?.toFixed(0) || "---"}<span className="text-xs font-normal text-muted-foreground ml-1">/night</span></p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!isLoadingHotels && hotelDeals.length === 0 && !hotelError && (
                    <div className="col-span-full text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                      <HotelIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No results for this selection. Try different dates or a city.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                  Travel SMARTER, <br />
                  Book <span className="gradient-text">FASTER</span>.
                </h2>
                <p className="text-lg text-muted-foreground">
                  Tripify uses advanced Google search technology to find you the best rates across thousands of providers, instantly combined into easy-to-book deals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Price Assurance</h3>
                  <p className="text-sm text-muted-foreground">We scour the web to ensure you're getting the best value for every dollar.</p>
                </div>
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Ease of Use</h3>
                  <p className="text-sm text-muted-foreground">A clean, focused interface designed for travelers, not advertisers.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl skew-y-1 transform hover:skew-y-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
                  alt="Travel experience"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-3xl overflow-hidden shadow-2xl hidden md:block border-8 border-background">
                <img
                  src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&q=80"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Deals;
