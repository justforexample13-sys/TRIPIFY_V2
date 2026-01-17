import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Flights from "./pages/Flights";
import Hotels from "./pages/Hotels";
import Deals from "./pages/Deals";
import FlightDetails from "./pages/FlightDetails";
import FlightConfirm from "./pages/FlightConfirm";
import HotelDetails from "./pages/HotelDetails";
import HotelConfirm from "./pages/HotelConfirm";
import FlightTicket from "./pages/FlightTicket";
import HotelTicket from "./pages/HotelTicket";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Faqs from "./pages/Faqs";
import Cancellation from "./pages/Cancellation";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/flights/details" element={<FlightDetails />} />
            <Route path="/flights/confirm" element={<FlightConfirm />} />
            <Route path="/flights/ticket" element={<FlightTicket />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/details" element={<HotelDetails />} />
            <Route path="/hotels/confirm" element={<HotelConfirm />} />
            <Route path="/hotels/ticket" element={<HotelTicket />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/cancellation" element={<Cancellation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
