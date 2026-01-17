import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Flight } from "@/hooks/useFlightSearch";
import { toast } from "@/hooks/use-toast";
import { createFlightTicketState } from "@/pages/FlightTicket";

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

const FlightConfirm = () => {
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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const onConfirm = () => {
    if (!flight) return;
    if (!fullName.trim() || !email.trim()) {
      toast({
        title: "Missing details",
        description: "Please enter your name and email to continue.",
        variant: "destructive",
      });
      return;
    }

    const ticket = createFlightTicketState(flight, { fullName: fullName.trim(), email: email.trim() });
    navigate("/flights/ticket", { state: { ticket } });
  };

  return (
    <Layout>
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Confirm Flight Booking</h1>
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
                  Please go back to Flights and select a flight.
                </p>
                <Button onClick={() => navigate("/flights")}>Go to Flights</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{flight.airline}</div>
                      <div className="text-sm text-muted-foreground">{flight.flightNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="text-xl font-bold text-primary">${flight.price}</div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground">From</div>
                      <div className="font-medium">{flight.departure.airport}</div>
                      <div className="text-xs text-muted-foreground">{flight.departure.time}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">To</div>
                      <div className="font-medium">{flight.arrival.airport}</div>
                      <div className="text-xs text-muted-foreground">{flight.arrival.time}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Passenger</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm mb-1">Full name</div>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div>
                      <div className="text-sm mb-1">Email</div>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" type="email" />
                    </div>
                    <Button className="w-full" onClick={onConfirm}>
                      Confirm (Demo)
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => navigate("/hotels")}
                    >
                      Browse Hotels
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/flights/details", { state: { flight } })}>
                      Back to Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default FlightConfirm;
