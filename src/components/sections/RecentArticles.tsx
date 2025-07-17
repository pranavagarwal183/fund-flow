import { Clock, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const RecentArticles = () => {
  const recentArticles = [
    {
      title: "Top Performing Equity Funds in 2024",
      preview: "Discover which equity mutual funds delivered exceptional returns this year and what factors contributed to their success.",
      readTime: "5 min",
      author: "Rajesh Kumar",
      date: "Dec 15, 2024",
      category: "Fund Performance"
    },
    {
      title: "New SEBI Guidelines: What Investors Need to Know",
      preview: "Recent regulatory changes affecting mutual fund investments and their impact on your portfolio strategy.",
      readTime: "7 min",
      author: "Priya Sharma",
      date: "Dec 12, 2024",
      category: "Regulatory"
    },
    {
      title: "SIP vs Lumpsum: Which Strategy Works Better?",
      preview: "Comprehensive analysis of investment strategies based on market conditions and investor psychology.",
      readTime: "6 min",
      author: "Amit Gupta",
      date: "Dec 10, 2024",
      category: "Investment Strategy"
    },
    {
      title: "Tax Planning with ELSS Funds",
      preview: "Maximize your tax savings while building wealth through Equity Linked Savings Schemes.",
      readTime: "4 min",
      author: "Neha Verma",
      date: "Dec 8, 2024",
      category: "Tax Planning"
    },
    {
      title: "Understanding Fund Expense Ratios",
      preview: "How expense ratios impact your returns and what constitutes a reasonable fee structure.",
      readTime: "5 min",
      author: "Sandeep Jain",
      date: "Dec 5, 2024",
      category: "Fund Analysis"
    },
    {
      title: "Market Volatility: Should You Pause Your SIP?",
      preview: "Expert advice on managing investments during turbulent market conditions and staying disciplined.",
      readTime: "8 min",
      author: "Kavita Rao",
      date: "Dec 3, 2024",
      category: "Market Analysis"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Latest Investment Insights</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest mutual fund insights, market updates, and expert investment advice
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {recentArticles.map((article, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {article.category}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {article.readTime}
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {article.preview}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {article.author}
                  </div>
                  <span>{article.date}</span>
                </div>
                <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Read More <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="group">
            View All Articles
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};