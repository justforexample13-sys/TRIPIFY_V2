import Layout from "@/components/layout/Layout";

const Contact = () => {
  return (
    <Layout>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground mb-8">
            Need help? Reach out and we’ll get back to you.
          </p>

          <div className="glass-card p-6 space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">support@trpify.com</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">+1 (555) 123-4567</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Hours</div>
              <div className="font-medium">24/7</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
