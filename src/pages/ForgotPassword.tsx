import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  return (
    <Layout>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-md">
          <h1 className="text-3xl font-bold mb-2">Reset password</h1>
          <p className="text-muted-foreground mb-6">
            This is a demo screen. Enter your email to simulate a password reset.
          </p>

          <div className="glass-card p-6 space-y-4">
            <div>
              <div className="text-sm mb-1">Email</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
            </div>
            <Button className="w-full" onClick={() => {}}>
              Send reset link
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
