import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleTryCalculators = () => {
    navigate("/calculators");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-primary-light/80 backdrop-blur text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Expert-Guided Investment Services
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Smart Mutual Fund
              <span className="block bg-gradient-to-r from-white to-primary-light bg-clip-text text-transparent">
                Investments Made Simple
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0">
              We provide expert-guided services that allow you to invest in mutual funds and plan for your financial goals. Our dedicated team actively monitors your portfolio and makes necessary adjustments to keep you on track to achieve your objectives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-strong" onClick={handleGetStarted}>
                {user ? "Go to Dashboard" : "Start Investing Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleTryCalculators}>
                <Calculator className="mr-2 h-5 w-5" />
                Try Calculators
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/80">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm">SEBI Registered</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span className="text-sm">₹500+ Cr Assets</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm">50,000+ Happy Investors</span>
              </div>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-strong">
              <div className="space-y-6">
                {/* Sample Portfolio Card */}
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Your Portfolio</h3>
                    <span className="text-success font-bold">+12.5%</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Value</span>
                      <span className="font-bold text-gray-900">₹2,45,750</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Invested</span>
                      <span className="font-medium text-gray-900">₹2,18,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gains</span>
                      <span className="font-bold text-success">+₹27,250</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="h-3 bg-primary rounded-full mb-2"></div>
                        <span className="text-xs text-gray-600">Equity 60%</span>
                      </div>
                      <div className="text-center">
                        <div className="h-3 bg-secondary rounded-full mb-2"></div>
                        <span className="text-xs text-gray-600">Debt 30%</span>
                      </div>
                      <div className="text-center">
                        <div className="h-3 bg-warning rounded-full mb-2"></div>
                        <span className="text-xs text-gray-600">Gold 10%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sample SIP Card */}
                <div className="bg-gradient-secondary rounded-xl p-6 text-white">
                  <h3 className="font-semibold mb-2">Active SIP</h3>
                  <div className="flex justify-between items-center">
                    <span>Monthly Investment</span>
                    <span className="font-bold">₹5,000</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm opacity-90">Next: 15th March</span>
                    <span className="text-sm opacity-90">Auto-debit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>
    </section>
  );
};