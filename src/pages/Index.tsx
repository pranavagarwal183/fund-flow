import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Calculators } from "@/components/sections/Calculators";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Calculators />
      <TrustIndicators />
      <Footer />
    </div>
  );
};

export default Index;
