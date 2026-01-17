import { CreditCard, Globe, HeadphonesIcon, Shield, Zap, Gift } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "500+ Airlines",
    description: "Access to flights from over 500 airlines worldwide with real-time availability.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Your payments are protected with bank-level encryption and security.",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    description: "Receive instant booking confirmation via email and SMS.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "Pay with credit card, PayPal, or split your payment over time.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our customer support team is available around the clock to help you.",
  },
  {
    icon: Gift,
    title: "Rewards Program",
    description: "Earn points on every booking and redeem for free trips.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">Trpify</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We're committed to making your travel experience seamless, secure, and memorable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-card p-6 lg:p-8 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
