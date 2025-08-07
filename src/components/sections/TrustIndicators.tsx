import { 
  Shield, 
  Users, 
  TrendingUp, 
  Award, 
  Star,
  CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    icon: Users,
    number: "50,000+",
    label: "Happy Investors",
    description: "Trust us with their financial future"
  },
  {
    icon: TrendingUp,
    number: "₹500+ Cr",
    label: "Assets Under Advisory",
    description: "Managing investments responsibly"
  },
  {
    icon: Award,
    number: "4.8/5",
    label: "Customer Rating",
    description: "Based on 10,000+ reviews"
  },
  {
    icon: Shield,
    number: "100%",
    label: "SEBI Compliant",
    description: "Fully regulated and secure"
  }
];

const certifications = [
  "SEBI Registered Investment Advisor",
  "ISO 27001 Certified",
  "PCI DSS Compliant",
  "SSL Encrypted Platform"
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    content: "FundFlow's AI recommendations helped me build a diversified portfolio that's grown 15% annually. The platform is incredibly user-friendly!",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    role: "Business Owner",
    content: "I've been investing through FundFlow for 2 years. Their goal-based planning helped me save for my daughter's education systematically.",
    rating: 5
  },
  {
    name: "Anita Desai",
    role: "Marketing Manager",
    content: "The calculators and analytics are outstanding. I can track my portfolio performance in real-time and make informed decisions.",
    rating: 5
  }
];

export const TrustIndicators = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by Thousands of Investors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join a community of smart investors who have chosen FundFlow to grow their wealth systematically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-soft hover:shadow-strong transition-all duration-300">
              <CardContent className="p-8">
                <div className="bg-primary-light dark:bg-primary/20 rounded-xl p-4 w-fit mb-4 mx-auto">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-foreground mb-2">
                  {stat.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-muted/50 dark:bg-muted/30 rounded-2xl p-8 mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Security & Compliance
            </h3>
            <p className="text-muted-foreground">
              We maintain the highest standards of security and regulatory compliance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-3 bg-background dark:bg-card rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            What Our Investors Say
          </h3>
          <p className="text-muted-foreground">
            Real stories from real investors who achieved their financial goals
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-strong transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-current" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="bg-primary dark:bg-primary/80 rounded-full p-3 mr-4">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};