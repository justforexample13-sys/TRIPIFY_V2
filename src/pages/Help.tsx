import Layout from "@/components/layout/Layout";

const Help = () => {
  return (
    <Layout>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground mb-8">
            Find answers to common questions about flights, hotels, payments, and changes.
          </p>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-2">Bookings</h2>
              <p className="text-sm text-muted-foreground">
                View details pages to confirm your selection. Booking confirmation screens are demo-only.
              </p>
            </div>
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-2">Payments</h2>
              <p className="text-sm text-muted-foreground">
                Payments are not processed in this demo. You can still explore the full user flow.
              </p>
            </div>
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-2">Changes & cancellations</h2>
              <p className="text-sm text-muted-foreground">
                See the Cancellation Policy page for demo rules and examples.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Help;
