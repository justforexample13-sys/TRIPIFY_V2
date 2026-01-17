import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Hotel } from "@/hooks/useHotelSearch";

type GuestInfo = {
  fullName: string;
  email: string;
};

type TicketState = {
  hotel: Hotel;
  guest: GuestInfo;
  reference: string;
  issuedAt: string;
};

const STORAGE_KEY = "hotelTicket";

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

const HotelTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const ticket = useMemo(() => {
    const state = location.state as any;
    const incoming = state?.ticket as TicketState | undefined;
    if (incoming?.hotel && incoming?.guest) {
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
            <h1 className="text-2xl lg:text-3xl font-bold">Booking Confirmed</h1>
            <Button variant="ghost" onClick={() => navigate("/hotels")}>Back to Hotels</Button>
          </div>

          {!ticket ? (
            <Card>
              <CardHeader>
                <CardTitle>No booking found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Please complete a booking to generate a confirmation.</p>
                <Button onClick={() => navigate("/hotels")}>Go to Hotels</Button>
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
                  <Button variant="default" onClick={() => navigate("/flights")}>Browse Flights</Button>
                  <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Guest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Full name</div>
                        <div className="font-medium">{ticket.guest.fullName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="font-medium">{ticket.guest.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hotel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="font-semibold">{ticket.hotel.name}</div>
                      <div className="text-sm text-muted-foreground">{ticket.hotel.location}</div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">From</div>
                        <div className="font-semibold text-primary">{ticket.hotel.currency} {ticket.hotel.price}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">per night</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                This confirmation is a UI mock for the Trpify demo.
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export function createHotelTicketState(hotel: Hotel, guest: GuestInfo): TicketState {
  return {
    hotel,
    guest,
    reference: makeReference(),
    issuedAt: new Date().toISOString(),
  };
}

export default HotelTicket;
