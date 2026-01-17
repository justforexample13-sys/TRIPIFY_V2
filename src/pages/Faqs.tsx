import Layout from "@/components/layout/Layout";

const Faqs = () => {
  const faqs = [
    {
      q: "Is this a real booking?",
      a: "No. This project demonstrates search + selection + confirmation UX using Amadeus APIs. Final confirmation is a mock ticket.",
    },
    {
      q: "Why do some origins show no flight deals?",
      a: "Amadeus test environment can return temporary system errors for some origins. Try major airport codes like LHR, CDG, DXB, JFK.",
    },
    {
      q: "Why do some cities have no hotels?",
      a: "Amadeus returns code 895 when nothing is found for the requested criteria. The app will show a clean empty state.",
    },
  ];

  return (
    <Layout>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">FAQs</h1>
          <p className="text-muted-foreground mb-8">Quick answers to common questions.</p>

          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="glass-card p-6">
                <div className="font-semibold mb-2">{f.q}</div>
                <div className="text-sm text-muted-foreground">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Faqs;
