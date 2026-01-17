import Layout from "@/components/layout/Layout";

const Cancellation = () => {
  return (
    <Layout>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Cancellation Policy</h1>
          <p className="text-muted-foreground mb-8">
            This is a demo policy page for the Trpify project.
          </p>

          <div className="glass-card p-6 space-y-4">
            <div>
              <div className="font-semibold">Flights</div>
              <div className="text-sm text-muted-foreground">
                Cancellation rules vary by airline and fare. The confirmation ticket is a mock for UI only.
              </div>
            </div>
            <div>
              <div className="font-semibold">Hotels</div>
              <div className="text-sm text-muted-foreground">
                Hotel cancellation depends on the rate type. In this demo, confirmation is mock-only.
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cancellation;
