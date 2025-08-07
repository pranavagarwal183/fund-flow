import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Calculator,
  Clock,
  User,
  Eye,
  Heart,
  Share2,
  Search,
  Filter,
  Star,
  ArrowRight,
  Play,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: number;
  author: string;
  publishDate: string;
  views: number;
  likes: number;
  tags: string[];
  featured?: boolean;
}

const Learn = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  const articles: Article[] = [
    {
      id: "1",
      title: "What is SIP and Why Should You Start One?",
      excerpt: "Learn about Systematic Investment Plans (SIP) and how they can help you build wealth systematically over time.",
      content: "A Systematic Investment Plan (SIP) is an investment strategy that allows you to invest a fixed amount regularly in mutual funds...",
      category: "Basics",
      difficulty: "Beginner",
      readTime: 5,
      author: "Investment Expert",
      publishDate: "2024-01-15",
      views: 1250,
      likes: 89,
      tags: ["SIP", "Mutual Funds", "Investment Basics"],
      featured: true
    },
    {
      id: "2",
      title: "Understanding Risk in Mutual Fund Investments",
      excerpt: "Explore different types of risks associated with mutual fund investments and how to manage them effectively.",
      content: "Risk is an inherent part of any investment. Understanding the different types of risks can help you make informed decisions...",
      category: "Risk Management",
      difficulty: "Intermediate",
      readTime: 8,
      author: "Risk Analyst",
      publishDate: "2024-01-10",
      views: 980,
      likes: 67,
      tags: ["Risk", "Investment", "Portfolio Management"]
    },
    {
      id: "3",
      title: "Asset Allocation: The Key to Portfolio Success",
      excerpt: "Discover how proper asset allocation can help you achieve your financial goals while managing risk.",
      content: "Asset allocation is the process of dividing your investment portfolio among different asset categories...",
      category: "Portfolio Management",
      difficulty: "Intermediate",
      readTime: 10,
      author: "Portfolio Manager",
      publishDate: "2024-01-08",
      views: 756,
      likes: 45,
      tags: ["Asset Allocation", "Portfolio", "Diversification"]
    },
    {
      id: "4",
      title: "Tax Benefits of Mutual Fund Investments",
      excerpt: "Learn about the various tax benefits available for mutual fund investors in India.",
      content: "Mutual funds offer several tax benefits that can help you save money and grow your wealth more efficiently...",
      category: "Taxation",
      difficulty: "Intermediate",
      readTime: 7,
      author: "Tax Advisor",
      publishDate: "2024-01-05",
      views: 1120,
      likes: 78,
      tags: ["Tax", "ELSS", "Tax Saving"]
    },
    {
      id: "5",
      title: "How to Choose the Right Mutual Fund",
      excerpt: "A comprehensive guide to selecting mutual funds that align with your investment goals and risk tolerance.",
      content: "Choosing the right mutual fund is crucial for achieving your financial objectives. Here's a step-by-step approach...",
      category: "Fund Selection",
      difficulty: "Beginner",
      readTime: 12,
      author: "Fund Analyst",
      publishDate: "2024-01-03",
      views: 890,
      likes: 56,
      tags: ["Fund Selection", "Research", "Due Diligence"]
    },
    {
      id: "6",
      title: "Advanced Portfolio Optimization Techniques",
      excerpt: "Explore advanced strategies for optimizing your investment portfolio for maximum returns.",
      content: "Portfolio optimization involves using mathematical models to find the optimal allocation of assets...",
      category: "Advanced Strategies",
      difficulty: "Advanced",
      readTime: 15,
      author: "Quantitative Analyst",
      publishDate: "2024-01-01",
      views: 445,
      likes: 23,
      tags: ["Optimization", "Advanced", "Quantitative"]
    }
  ];

  const categories = [
    { id: "all", name: "All Topics", icon: BookOpen },
    { id: "Basics", name: "Basics", icon: TrendingUp },
    { id: "Risk Management", name: "Risk Management", icon: Shield },
    { id: "Portfolio Management", name: "Portfolio Management", icon: Calculator },
    { id: "Taxation", name: "Taxation", icon: Calculator },
    { id: "Fund Selection", name: "Fund Selection", icon: Star },
    { id: "Advanced Strategies", name: "Advanced Strategies", icon: TrendingUp }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (articleId: string) => {
    const newLikedArticles = new Set(likedArticles);
    if (newLikedArticles.has(articleId)) {
      newLikedArticles.delete(articleId);
    } else {
      newLikedArticles.add(articleId);
    }
    setLikedArticles(newLikedArticles);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <motion.main 
        className="flex-1 container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Learn & Grow Your Knowledge
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Master the fundamentals of mutual fund investing with our comprehensive educational content. 
              From basics to advanced strategies, we've got you covered.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
            <Button variant="outline" className="micro-press">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center space-x-2 micro-press"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden lg:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Featured Article */}
        {filteredArticles.find(article => article.featured) && (
          <motion.div className="mb-8" variants={itemVariants}>
            <Card className="shadow-soft card-hover border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    <Badge variant="outline">Beginner</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                </div>
                <CardTitle className="text-xl lg:text-2xl">
                  What is SIP and Why Should You Start One?
                </CardTitle>
                <p className="text-muted-foreground">
                  Learn about Systematic Investment Plans (SIP) and how they can help you build wealth systematically over time.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>By Investment Expert</span>
                    <span>•</span>
                    <span>Jan 15, 2024</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>1,250 views</span>
                    </div>
                  </div>
                  <Button className="micro-press">
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Articles Grid */}
        <motion.div 
          className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {filteredArticles.map((article) => (
            <motion.div key={article.id} variants={itemVariants}>
              <Card className="shadow-soft card-hover h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{article.difficulty}</Badge>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime} min</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">{article.excerpt}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-4">
                      <span>By {article.author}</span>
                      <span>•</span>
                      <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(article.id)}
                        className={`micro-press ${likedArticles.has(article.id) ? 'text-red-500' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${likedArticles.has(article.id) ? 'fill-current' : ''}`} />
                        <span>{article.likes + (likedArticles.has(article.id) ? 1 : 0)}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="micro-press">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm" className="micro-press">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse all categories.
            </p>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div className="mt-16 text-center" variants={itemVariants}>
          <Card className="shadow-soft bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Start Your Investment Journey?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Apply what you've learned and start building your portfolio with our expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="micro-press">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Video Tutorials
                </Button>
                <Button variant="outline" size="lg" className="micro-press">
                  <Download className="h-5 w-5 mr-2" />
                  Download Investment Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default Learn; 