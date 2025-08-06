import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { RecentArticles } from "@/components/sections/RecentArticles";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const portfolioData = {
    currentValue: 245750,
    totalInvested: 218500,
    totalGains: 27250,
    gainsPercentage: 12.47,
  };

  const formatCurrency = (amount: number) => {
    if (!showBalance) return "₹ ****";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Conditional Portfolio Section - Only for Logged-in Users */}
      {user && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Your Portfolio Overview
                </h2>
                <p className="text-muted-foreground">Track your investment growth and performance</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-soft">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Portfolio Value</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {formatCurrency(portfolioData.currentValue)}
                    </div>
                    <div className="flex items-center text-sm text-success">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+{formatCurrency(portfolioData.totalGains)} ({portfolioData.gainsPercentage}%)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Total Invested
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(portfolioData.totalInvested)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm" onClick={() => navigate("/dashboard")}>View Full Dashboard</Button>
                    <Button variant="outline" className="w-full" size="sm" onClick={() => navigate("/funds")}>Start New SIP</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      <Features />
      <HowItWorks />
      <RecentArticles />
      <TrustIndicators />
      <Footer />
    </div>
  );
};

export default Index;
