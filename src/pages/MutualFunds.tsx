import { MutualFundEducation } from "@/components/sections/MutualFundEducation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const MutualFunds = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <MutualFundEducation />
      <Footer />
    </div>
  );
};

export default MutualFunds;