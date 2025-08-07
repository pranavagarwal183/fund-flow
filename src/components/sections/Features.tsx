import { 
  Brain, 
  Target, 
  Shield, 
  TrendingUp, 
  Calculator, 
  PieChart,
  Smartphone,
  Clock,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Expert Investment Guidance",
    description: "Get personalized fund recommendations from our experienced team of financial experts who analyze market trends and align them with your financial goals."
  },
  {
    icon: Target,
    title: "Goal-Based Planning",
    description: "Set specific financial targets and get customized investment strategies to achieve your dreams - whether it's a house, education, or retirement."
  },
  {
    icon: Calculator,
    title: "Smart Calculators",
    description: "Use our comprehensive suite of calculators for SIP, lumpsum, goal planning, and tax savings to make informed investment decisions."
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description: "Track your investments with detailed performance analytics, risk assessment, and portfolio diversification insights."
  },
  {
    icon: Shield,
    title: "SEBI Compliant",
    description: "Invest with confidence knowing all our recommendations and processes comply with SEBI regulations and industry best practices."
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Manage your investments on-the-go with our responsive design that works seamlessly across all devices."
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Stay informed with live NAV updates, market news, and instant notifications about your portfolio performance."
  },
  {
    icon: Award,
    title: "Expert Insights",
    description: "Access research reports, market analysis, and expert recommendations to stay ahead of market trends."
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Monitor your investment growth with detailed charts, benchmark comparisons, and progress towards your financial goals."
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Build Wealth
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and intelligent insights to make mutual fund investing simple, 
            profitable, and aligned with your financial goals.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-strong transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="bg-primary-light dark:bg-primary/20 rounded-xl p-4 w-fit mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};