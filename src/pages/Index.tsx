import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { RecentArticles } from "@/components/sections/RecentArticles";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <RecentArticles />
      <TrustIndicators />
      <Footer />
    </div>
  );
};

export default Index;
