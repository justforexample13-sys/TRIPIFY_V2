import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Flight } from "@/hooks/useFlightSearch";

const STORAGE_KEY = "selectedFlight";

function readStoredFlight(): Flight | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Flight;
  } catch {
    return null;
  }
}

function storeFlight(flight: Flight) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flight));
  } catch {}
}

const FlightDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const flight = useMemo(() => {
    const stateFlight = (location.state as any)?.flight as Flight | undefined;
    if (stateFlight) {
      storeFlight(stateFlight);
      return stateFlight;
    }
    return readStoredFlight();
  }, [location.state]);

  return (
    <Layout>
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Flight Details</h1>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>

          {!flight ? (
            <Card>
              <CardHeader>
                <CardTitle>No flight selected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Please go back to Flights and select a flight to view details.
                </p>
                <Button onClick={() => navigate("/flights")}>Go to Flights</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{flight.airline}</CardTitle>
                  <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Departure</div>
                      <div className="text-xl font-semibold">{flight.departure.time}</div>
                      <div className="text-sm">{flight.departure.airport}</div>
                      <div className="text-xs text-muted-foreground">{flight.departure.city}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Arrival</div>
                      <div className="text-xl font-semibold">{flight.arrival.time}</div>
                      <div className="text-sm">{flight.arrival.airport}</div>
                      <div className="text-xs text-muted-foreground">{flight.arrival.city}</div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="font-medium">{flight.duration}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Stops</div>
                      <div className="font-medium">{flight.stops}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Cabin</div>
                      <div className="font-medium">{flight.class}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-semibold text-primary">${flight.price}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confirm</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Continue to confirm this itinerary.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/flights/confirm", { state: { flight } })}
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

export default FlightDetails;
