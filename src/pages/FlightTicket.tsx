import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Flight } from "@/hooks/useFlightSearch";

type PassengerInfo = {
  fullName: string;
  email: string;
};

type TicketState = {
  flight: Flight;
  passenger: PassengerInfo;
  reference: string;
  issuedAt: string;
};

const STORAGE_KEY = "flightTicket";

function readStoredTicket(): TicketState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TicketState;
  } catch {
    return null;
  }
}

function storeTicket(ticket: TicketState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ticket));
  } catch {}
}

function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

const FlightTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const ticket = useMemo(() => {
    const state = location.state as any;
    const incoming = state?.ticket as TicketState | undefined;
    if (incoming?.flight && incoming?.passenger) {
      storeTicket(incoming);
      return incoming;
    }
    return readStoredTicket();
  }, [location.state]);

  return (
    <Layout>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Ticket Confirmed</h1>
            <Button variant="ghost" onClick={() => navigate("/flights")}>Back to Flights</Button>
          </div>

          {!ticket ? (
            <Card>
              <CardHeader>
                <CardTitle>No ticket found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Please complete a booking to generate a ticket.</p>
                <Button onClick={() => navigate("/flights")}>Go to Flights</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="glass-card p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Booking Reference</div>
                  <div className="text-3xl font-bold tracking-widest">{ticket.reference}</div>
                  <div className="text-xs text-muted-foreground mt-1">Issued {new Date(ticket.issuedAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-3">
                  <Button variant="default" onClick={() => navigate("/hotels")}>Browse Hotels</Button>
                  <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Passenger</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Full name</div>
                        <div className="font-medium">{ticket.passenger.fullName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="font-medium">{ticket.passenger.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Flight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{ticket.flight.airline}</div>
                          <div className="text-sm text-muted-foreground">{ticket.flight.flightNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Total</div>
                          <div className="font-semibold text-primary">${ticket.flight.price}</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">From</div>
                          <div className="font-medium">{ticket.flight.departure.airport}</div>
                          <div className="text-xs text-muted-foreground">{ticket.flight.departure.time}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">To</div>
                          <div className="font-medium">{ticket.flight.arrival.airport}</div>
                          <div className="text-xs text-muted-foreground">{ticket.flight.arrival.time}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Cabin</div>
                          <div className="text-sm font-medium">{ticket.flight.class}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Stops</div>
                          <div className="text-sm font-medium">{ticket.flight.stops}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="text-sm font-medium">{ticket.flight.duration}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                This ticket is a UI mock confirmation for the Trpify demo.
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export function createFlightTicketState(flight: Flight, passenger: PassengerInfo): TicketState {
  return {
    flight,
    passenger,
    reference: makeReference(),
    issuedAt: new Date().toISOString(),
  };
}

export default FlightTicket;
