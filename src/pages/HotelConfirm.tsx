import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Hotel } from "@/hooks/useHotelSearch";
import { toast } from "@/hooks/use-toast";
import { createHotelTicketState } from "@/pages/HotelTicket";

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

const HotelConfirm = () => {
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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const onConfirm = () => {
    if (!hotel) return;
    if (!fullName.trim() || !email.trim()) {
      toast({
        title: "Missing details",
        description: "Please enter your name and email to continue.",
        variant: "destructive",
      });
      return;
    }

    const ticket = createHotelTicketState(hotel, { fullName: fullName.trim(), email: email.trim() });
    navigate("/hotels/ticket", { state: { ticket } });
  };

  return (
    <Layout>
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Confirm Hotel Booking</h1>
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
                <p className="text-muted-foreground mb-4">Please go back to Hotels and select a hotel.</p>
                <Button onClick={() => navigate("/hotels")}>Go to Hotels</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Stay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{hotel.name}</div>
                      <div className="text-sm text-muted-foreground">{hotel.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">From</div>
                      <div className="text-xl font-bold text-primary">
                        {hotel.currency} {hotel.price}
                      </div>
                      <div className="text-xs text-muted-foreground">/night</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guest</CardTitle>
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
                    <Button variant="outline" className="w-full" onClick={() => navigate("/hotels/details", { state: { hotel } })}>
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

export default HotelConfirm;
