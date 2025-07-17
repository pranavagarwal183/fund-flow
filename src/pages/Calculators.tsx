import { CalculatorsOnly } from "@/components/sections/CalculatorsOnly";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Calculators = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CalculatorsOnly />
      <Footer />
    </div>
  );
};

export default Calculators;