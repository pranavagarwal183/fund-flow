import { 
  UserCheck, 
  Target, 
  Search, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserCheck,
    title: "Create Your Profile",
    description: "Complete your KYC and tell us about your financial goals, risk tolerance, and investment preferences.",
    details: ["Quick KYC verification", "Risk assessment questionnaire", "Goal setting wizard"]
  },
  {
    icon: Search,
    title: "Get AI Recommendations",
    description: "Our advanced algorithms analyze thousands of funds to suggest the perfect portfolio for your needs.",
    details: ["Personalized fund selection", "Risk-adjusted returns", "Diversification optimization"]
  },
  {
    icon: Target,
    title: "Start Investing",
    description: "Begin your investment journey with SIPs or lumpsum investments through our secure platform.",
    details: ["Flexible SIP options", "Auto-debit facility", "Instant investment confirmation"]
  },
  {
    icon: TrendingUp,
    title: "Track & Grow",
    description: "Monitor your portfolio performance and get alerts for rebalancing opportunities.",
    details: ["Real-time tracking", "Performance analytics", "Rebalancing alerts"]
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your investment journey in just four simple steps. Our intelligent platform 
            guides you through every stage of your financial growth.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines for Desktop */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-2 border-transparent hover:border-primary/20 shadow-soft hover:shadow-strong transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  {/* Step Number */}
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mb-6 mx-auto">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="bg-primary-light rounded-xl p-4 w-fit mb-6 mx-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <step.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Details */}
                  <ul className="space-y-2 mb-6">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Arrow for Desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-20 text-primary/40">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-primary">
            Start Your Investment Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};