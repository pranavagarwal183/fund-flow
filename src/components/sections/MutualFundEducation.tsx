import { Play, Clock, BookOpen, Users, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const MutualFundEducation = () => {
  const educationalVideos = [
    {
      title: "What are Mutual Funds?",
      description: "Basic introduction to mutual funds and how they work",
      duration: "5:30",
      thumbnail: "/placeholder.svg",
      level: "Beginner"
    },
    {
      title: "SIP vs Lumpsum Investment",
      description: "Understanding the difference and choosing the right strategy",
      duration: "7:45",
      thumbnail: "/placeholder.svg",
      level: "Intermediate"
    },
    {
      title: "Understanding Risk & Returns",
      description: "How to evaluate risk-return trade-offs in investments",
      duration: "6:20",
      thumbnail: "/placeholder.svg",
      level: "Intermediate"
    },
    {
      title: "Tax Benefits of Mutual Funds",
      description: "ELSS and other tax-saving investment options explained",
      duration: "8:15",
      thumbnail: "/placeholder.svg",
      level: "Advanced"
    }
  ];

  const faqs = [
    {
      question: "What is the minimum amount to start SIP?",
      answer: "Most mutual funds allow you to start SIP with as low as ₹500 per month. However, some funds may have higher minimum amounts, typically ₹1,000 or ₹2,500 per month."
    },
    {
      question: "Can I modify my SIP amount?",
      answer: "Yes, you can modify your SIP amount by placing a new SIP request or using the step-up SIP feature. Some AMCs also allow online modification through their portals."
    },
    {
      question: "How are mutual fund returns calculated?",
      answer: "Mutual fund returns are calculated using NAV (Net Asset Value). Returns can be measured as absolute returns or annualized returns using CAGR (Compound Annual Growth Rate)."
    },
    {
      question: "What happens if I miss a SIP payment?",
      answer: "If you miss 1-2 SIP payments, your SIP continues. However, if you miss payments consecutively for 3 months or more, your SIP may get auto-cancelled by the AMC."
    },
    {
      question: "Are mutual funds better than FDs?",
      answer: "Mutual funds, especially equity funds, have the potential to provide higher returns than FDs over the long term, but they come with market risks. FDs provide guaranteed returns but may not beat inflation."
    },
    {
      question: "How to choose the right mutual fund?",
      answer: "Consider factors like your financial goals, risk tolerance, investment horizon, fund performance, expense ratio, fund manager track record, and fund house reputation."
    }
  ];

  const investmentTips = [
    {
      icon: TrendingUp,
      title: "Start Early",
      description: "The power of compounding works best when you start investing early. Even small amounts can grow significantly over time."
    },
    {
      icon: Shield,
      title: "Diversify Your Portfolio",
      description: "Don't put all eggs in one basket. Invest across different asset classes and fund categories to reduce risk."
    },
    {
      icon: BookOpen,
      title: "Stay Informed",
      description: "Regularly review your investments and stay updated with market trends and fund performance."
    },
    {
      icon: Users,
      title: "Consult Experts",
      description: "When in doubt, consult with financial advisors or use robo-advisory services for personalized recommendations."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Educational Videos Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Mutual Fund Education Center</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn everything about mutual funds through our comprehensive video library and expert insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {educationalVideos.map((video, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary/90 p-3 rounded-full group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    {video.level}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Investment Tips */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Smart Investment Tips</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {investmentTips.map((tip, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
                    <tip.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{tip.title}</h4>
                  <p className="text-muted-foreground text-sm">{tip.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};