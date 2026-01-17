import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import FeaturesSection from "@/components/home/FeaturesSection";
import DealsSection from "@/components/home/DealsSection";
import CtaSection from "@/components/home/CtaSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PopularDestinations />
      <FeaturesSection />
      <DealsSection />
      <CtaSection />
    </Layout>
  );
};

export default Index;
