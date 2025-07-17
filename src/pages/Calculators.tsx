import { Calculators as CalculatorsSection } from "@/components/sections/Calculators";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Calculators = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CalculatorsSection />
      <Footer />
    </div>
  );
};

export default Calculators;