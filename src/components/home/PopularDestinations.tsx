import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const destinations = [
  {
    id: 1,
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    price: "From $299",
    type: "Flights",
  },
  {
    id: 2,
    name: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    price: "From $599",
    type: "Flights",
  },
  {
    id: 3,
    name: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    price: "From $199",
    type: "Hotels",
  },
  {
    id: 4,
    name: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    price: "From $449",
    type: "Flights",
  },
  {
    id: 5,
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    price: "From $89/night",
    type: "Hotels",
  },
  {
    id: 6,
    name: "London",
    country: "UK",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    price: "From $349",
    type: "Flights",
  },
];

const PopularDestinations = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Popular <span className="gradient-text">Destinations</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg">
              Discover trending destinations loved by millions of travelers worldwide.
            </p>
          </div>
          <Link
            to="/deals"
            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View all deals
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <Link
              key={destination.id}
              to={destination.type === 'Hotels' ? '/hotels' : '/flights'}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] card-hover animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={destination.image}
                alt={destination.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                {destination.type}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {destination.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {destination.country}
                </p>
                <p className="text-primary font-semibold">
                  {destination.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
