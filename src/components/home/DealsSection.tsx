import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const deals = [
  {
    id: 1,
    title: "Last Minute Flights",
    subtitle: "Book within 24 hours",
    discount: "Up to 40% OFF",
    bgGradient: "from-primary/20 via-primary/10 to-transparent",
    icon: Clock,
  },
  {
    id: 2,
    title: "Hot Summer Deals",
    subtitle: "Beach destinations",
    discount: "Save $200+",
    bgGradient: "from-accent/20 via-accent/10 to-transparent",
    icon: Flame,
  },
];

const DealsSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Exclusive <span className="gradient-text">Deals</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg">
              Limited-time offers you don't want to miss.
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

        {/* Deals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.map((deal, index) => {
            const Icon = deal.icon;
            return (
              <div
                key={deal.id}
                className={`relative overflow-hidden rounded-2xl p-8 lg:p-10 glass-card animate-fade-in bg-gradient-to-br ${deal.bgGradient}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {deal.discount}
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                    {deal.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {deal.subtitle}
                  </p>
                  <Link to="/deals">
                    <Button variant="secondary" className="group">
                      Explore Deals
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>

                {/* Decorative Element */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
