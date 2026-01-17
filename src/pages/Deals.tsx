import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plane, Hotel as HotelIcon, MapPin, Calendar, Star } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");

  const [flightOrigin, setFlightOrigin] = useState("LHR");
  const [flightMaxPrice, setFlightMaxPrice] = useState("250");

  const [hotelCity, setHotelCity] = useState("DXB");
  const [hotelCheckIn, setHotelCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [hotelCheckOut, setHotelCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 17);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [flightDeals, setFlightDeals] = useState<FlightDeal[]>([]);
  const [hotelDeals, setHotelDeals] = useState<HotelDeal[]>([]);

  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [flightError, setFlightError] = useState<string | null>(null);
  const [hotelError, setHotelError] = useState<string | null>(null);

  const canSearchFlights = useMemo(() => /^[A-Z]{3}$/.test(flightOrigin.trim().toUpperCase()), [flightOrigin]);
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
      const raw = await res.text();
      if (!res.ok) {
        throw new Error(raw || "Failed to load flight deals");
      }

      const json = JSON.parse(raw);
      const deals: FlightDeal[] = (json?.data || []).map((d: any, idx: number) => ({
        id: String(d?.id || `${d?.origin}-${d?.destination}-${idx}`),
        origin: d?.origin,
        destination: d?.destination,
        departureDate: d?.departureDate,
        returnDate: d?.returnDate,
        priceTotal: toNumber(d?.price?.total),
        currency: d?.price?.currency,
      }));
      setFlightDeals(deals);
    } catch (e: any) {
      setFlightDeals([]);
      setFlightError(e?.message || "Failed to load flight deals");
    } finally {
      setIsLoadingFlights(false);
    }
  };

  const fetchHotelDeals = async () => {
    setIsLoadingHotels(true);
    setHotelError(null);
    try {
      const url = new URL("/api/deals/hotels", window.location.origin);
      url.searchParams.set("city", hotelCity.trim());
      url.searchParams.set("checkInDate", hotelCheckIn);
      url.searchParams.set("checkOutDate", hotelCheckOut);
      url.searchParams.set("adults", "2");

      const res = await fetch(url.toString());
      const raw = await res.text();
      if (!res.ok) {
        throw new Error(raw || "Failed to load hotel deals");
      }

      const json = JSON.parse(raw);
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
    } catch (e: any) {
      setHotelDeals([]);
      setHotelError(e?.message || "Failed to load hotel deals");
    } finally {
      setIsLoadingHotels(false);
    }
  };

  useEffect(() => {
    fetchFlightDeals();
  }, []);

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
              Discover incredible savings on flights and hotels worldwide. Limited-time offers you don't want to miss.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold mb-8">Featured Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDeals.map((deal, index) => (
              <div
                key={deal.id}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {deal.discount}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-xs uppercase tracking-wider text-primary font-medium">{deal.type}</span>
                  <h3 className="text-xl font-bold text-foreground mt-1">{deal.title}</h3>
                  <p className="text-muted-foreground text-sm">{deal.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto glass-card p-6 lg:p-8">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="flights" className="flex-1 gap-2">
                  <Plane className="w-4 h-4" />
                  Flight Deals
                </TabsTrigger>
                <TabsTrigger value="hotels" className="flex-1 gap-2">
                  <HotelIcon className="w-4 h-4" />
                  Hotel Deals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flights" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Origin (IATA)</label>
                    <Input value={flightOrigin} onChange={(e) => setFlightOrigin(e.target.value)} placeholder="LON" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Price</label>
                    <Input value={flightMaxPrice} onChange={(e) => setFlightMaxPrice(e.target.value)} placeholder="250" />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" disabled={!canSearchFlights || isLoadingFlights} onClick={fetchFlightDeals}>
                      {isLoadingFlights ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading</span>
                      ) : (
                        "Search Deals"
                      )}
                    </Button>
                  </div>
                </div>

                {flightError && <div className="text-sm text-destructive mb-4">{flightError}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flightDeals.map((d, idx) => (
                    <Card key={d.id} className="overflow-hidden group card-hover">
                      <div className="relative h-32">
                        <img 
                          src={flightImages[idx % flightImages.length]} 
                          alt={`${d.origin} to ${d.destination}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-foreground">
                          <Plane className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{d.origin} → {d.destination}</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {d.departureDate || "Flexible"}
                          </div>
                          <div className="font-bold text-primary text-lg">
                            {d.priceTotal !== undefined ? `$${d.priceTotal.toFixed(0)}` : "—"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!isLoadingFlights && flightDeals.length === 0 && !flightError && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">No flight deals found.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="hotels" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div>
                    <label className="text-sm font-medium mb-2 block">City (IATA or name)</label>
                    <Input value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} placeholder="DXB" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Check-in</label>
                    <Input value={hotelCheckIn} onChange={(e) => setHotelCheckIn(e.target.value)} type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Check-out</label>
                    <Input value={hotelCheckOut} onChange={(e) => setHotelCheckOut(e.target.value)} type="date" />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" disabled={!canSearchHotels || isLoadingHotels} onClick={fetchHotelDeals}>
                      {isLoadingHotels ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading</span>
                      ) : (
                        "Search Deals"
                      )}
                    </Button>
                  </div>
                </div>

                {hotelError && <div className="text-sm text-destructive mb-4">{hotelError}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotelDeals.map((d, idx) => (
                    <Card key={d.id} className="overflow-hidden group card-hover">
                      <div className="relative h-32">
                        <img 
                          src={hotelImages[idx % hotelImages.length]} 
                          alt={d.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>4.5</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate mb-1">{d.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {d.cityCode || "—"}
                          </div>
                          <div className="font-bold text-primary text-lg">
                            {d.priceTotal !== undefined ? `$${d.priceTotal.toFixed(0)}` : "—"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!isLoadingHotels && hotelDeals.length === 0 && !hotelError && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">No hotel deals found.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Why Book With <span className="gradient-text">Tripify</span>?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Best Price Guarantee</h3>
                    <p className="text-muted-foreground text-sm">We match any lower price you find elsewhere.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Flexible Booking</h3>
                    <p className="text-muted-foreground text-sm">Free cancellation on most bookings.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Support</h3>
                    <p className="text-muted-foreground text-sm">Our travel experts are always here to help.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" 
                alt="Travel experience"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-2xl overflow-hidden shadow-xl hidden lg:block">
                <img 
                  src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&q=80" 
                  alt="Adventure"
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
