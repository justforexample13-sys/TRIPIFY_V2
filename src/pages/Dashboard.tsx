import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Settings, 
  Heart,
  Clock,
  TrendingUp,
  Star,
  ArrowRight
} from "lucide-react";

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: "Total Trips", value: "12", icon: Plane, color: "text-blue-500" },
    { label: "Hotels Booked", value: "8", icon: Hotel, color: "text-green-500" },
    { label: "Countries Visited", value: "5", icon: MapPin, color: "text-purple-500" },
    { label: "Rewards Points", value: "2,450", icon: Star, color: "text-yellow-500" },
  ];

  const upcomingTrips = [
    {
      id: 1,
      destination: "Paris, France",
      date: "Mar 15 - Mar 22, 2026",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80",
      type: "Flight + Hotel"
    },
    {
      id: 2,
      destination: "Tokyo, Japan",
      date: "Apr 5 - Apr 12, 2026",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
      type: "Flight"
    },
  ];

  const quickActions = [
    { label: "Book a Flight", icon: Plane, href: "/flights", color: "bg-blue-500/10 text-blue-500" },
    { label: "Find Hotels", icon: Hotel, href: "/hotels", color: "bg-green-500/10 text-green-500" },
    { label: "View Deals", icon: TrendingUp, href: "/deals", color: "bg-purple-500/10 text-purple-500" },
    { label: "My Favorites", icon: Heart, href: "#", color: "bg-red-500/10 text-red-500" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Welcome back, <span className="gradient-text">{user?.user_metadata?.full_name || 'Traveler'}</span>!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Ready for your next adventure? Explore deals, manage bookings, and plan your perfect trip.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" onClick={() => navigate('/flights')}>
                <Plane className="w-5 h-5 mr-2" />
                Search Flights
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/hotels')}>
                <Hotel className="w-5 h-5 mr-2" />
                Find Hotels
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-12 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="glass-card p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} bg-current/10 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.href)}
                  className="glass-card p-6 text-left card-hover group"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="font-semibold">{action.label}</p>
                  <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Trips */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Upcoming Trips</h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="glass-card overflow-hidden card-hover">
                  <div className="flex">
                    <div className="w-32 h-32 shrink-0">
                      <img
                        src={trip.image}
                        alt={trip.destination}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 flex-1">
                      <h3 className="font-semibold text-lg mb-1">{trip.destination}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        {trip.date}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {trip.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Plane className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No upcoming trips</h3>
              <p className="text-muted-foreground mb-6">Start planning your next adventure!</p>
              <Button variant="default" onClick={() => navigate('/flights')}>
                Book a Trip
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Account Settings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Account</h2>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.user_metadata?.full_name || 'User'}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Settings</span>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Payment Methods</span>
              </button>
              <button 
                onClick={signOut}
                className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
