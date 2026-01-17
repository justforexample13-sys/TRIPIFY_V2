import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Hotel } from "@/hooks/useHotelSearch";

const STORAGE_KEY = "selectedHotel";

function readStoredHotel(): Hotel | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Hotel;
  } catch {
    return null;
  }
}

function storeHotel(hotel: Hotel) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hotel));
  } catch {}
}

const HotelDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hotel = useMemo(() => {
    const stateHotel = (location.state as any)?.hotel as Hotel | undefined;
    if (stateHotel) {
      storeHotel(stateHotel);
      return stateHotel;
    }
    return readStoredHotel();
  }, [location.state]);

  return (
    <Layout>
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Hotel Details</h1>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>

          {!hotel ? (
            <Card>
              <CardHeader>
                <CardTitle>No hotel selected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Please go back to Hotels and select a hotel to view details.
                </p>
                <Button onClick={() => navigate("/hotels")}>Go to Hotels</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 overflow-hidden">
                <div className="h-56">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{hotel.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{hotel.location}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                      <div className="font-medium">{hotel.rating}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                      <div className="font-medium">{hotel.reviews}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-medium">{hotel.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-semibold text-primary">
                        {hotel.currency} {hotel.price}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <div className="text-sm font-medium mb-2">Amenities</div>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((a) => (
                        <span key={a} className="px-3 py-1 rounded-full bg-muted text-sm">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confirm</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Continue to confirm this stay.</p>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/hotels/confirm", { state: { hotel } })}
                  >
                    Confirm Booking
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HotelDetails;
