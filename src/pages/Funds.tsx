import { useState } from "react";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Star,
  Eye,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Funds = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("returns");

  const funds = [
    {
      id: 1,
      name: "HDFC Top 100 Fund",
      category: "Large Cap",
      rating: 5,
      nav: 239.15,
      returns: {
        "1Y": 15.67,
        "3Y": 12.45,
        "5Y": 11.23
      },
      expenseRatio: 1.25,
      aum: "₹25,450 Cr",
      riskLevel: "Moderate",
      minInvestment: 500,
      sipMinimum: 500,
      isRecommended: true
    },
    {
      id: 2,
      name: "Axis Midcap Fund",
      category: "Mid Cap",
      rating: 4,
      nav: 244.12,
      returns: {
        "1Y": 18.23,
        "3Y": 15.67,
        "5Y": 13.45
      },
      expenseRatio: 1.75,
      aum: "₹8,750 Cr",
      riskLevel: "High",
      minInvestment: 500,
      sipMinimum: 500,
      isRecommended: false
    },
    {
      id: 3,
      name: "ICICI Prudential Bluechip",
      category: "Large Cap",
      rating: 4,
      nav: 210.56,
      returns: {
        "1Y": 14.32,
        "3Y": 11.89,
        "5Y": 10.67
      },
      expenseRatio: 1.05,
      aum: "₹32,100 Cr",
      riskLevel: "Moderate",
      minInvestment: 100,
      sipMinimum: 100,
      isRecommended: true
    },
    {
      id: 4,
      name: "SBI Small Cap Fund",
      category: "Small Cap",
      rating: 3,
      nav: 245.67,
      returns: {
        "1Y": 22.45,
        "3Y": 18.92,
        "5Y": 16.78
      },
      expenseRatio: 2.25,
      aum: "₹4,250 Cr",
      riskLevel: "Very High",
      minInvestment: 500,
      sipMinimum: 500,
      isRecommended: false
    },
    {
      id: 5,
      name: "UTI Nifty Index Fund",
      category: "Index",
      rating: 4,
      nav: 130.89,
      returns: {
        "1Y": 13.45,
        "3Y": 10.23,
        "5Y": 9.87
      },
      expenseRatio: 0.10,
      aum: "₹15,670 Cr",
      riskLevel: "Moderate",
      minInvestment: 500,
      sipMinimum: 500,
      isRecommended: true
    },
    {
      id: 6,
      name: "Franklin India Focused Equity",
      category: "Multi Cap",
      rating: 4,
      nav: 156.78,
      returns: {
        "1Y": 16.78,
        "3Y": 13.56,
        "5Y": 12.34
      },
      expenseRatio: 1.95,
      aum: "₹6,890 Cr",
      riskLevel: "High",
      minInvestment: 500,
      sipMinimum: 500,
      isRecommended: false
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Large Cap", label: "Large Cap" },
    { value: "Mid Cap", label: "Mid Cap" },
    { value: "Small Cap", label: "Small Cap" },
    { value: "Multi Cap", label: "Multi Cap" },
    { value: "Index", label: "Index" }
  ];

  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || fund.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-success";
      case "Moderate": return "text-warning";
      case "High": return "text-orange-500";
      case "Very High": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Explore Mutual Funds
          </h1>
          <p className="text-muted-foreground">
            Discover and compare thousands of mutual funds to build your perfect portfolio
          </p>
        </div>

        {/* Filters */}
        <Card className="shadow-soft mb-8">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search funds by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="returns">Returns</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="aum">AUM</SelectItem>
                  <SelectItem value="expense">Expense Ratio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Fund List */}
        <div className="space-y-4">
          {filteredFunds.map((fund) => (
            <Card key={fund.id} className="shadow-soft hover:shadow-strong transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-12 gap-6 items-center">
                  {/* Fund Info */}
                  <div className="lg:col-span-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-foreground">{fund.name}</h3>
                          {fund.isRecommended && (
                            <Badge className="bg-primary text-primary-foreground">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <Badge variant="outline">{fund.category}</Badge>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < fund.rating ? 'text-warning fill-current' : 'text-muted-foreground'}`} 
                              />
                            ))}
                            <span className="ml-1">({fund.rating})</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          NAV: ₹{fund.nav} | AUM: {fund.aum}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Returns */}
                  <div className="lg:col-span-3">
                    <div className="text-sm text-muted-foreground mb-2">Returns (Annualized)</div>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(fund.returns).map(([period, return_]) => (
                        <div key={period} className="text-center">
                          <div className="text-xs text-muted-foreground">{period}</div>
                          <div className={`font-semibold ${return_ >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {return_ >= 0 ? '+' : ''}{return_}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fund Details */}
                  <div className="lg:col-span-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expense Ratio:</span>
                        <span className="font-medium">{fund.expenseRatio}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <span className={`font-medium ${getRiskColor(fund.riskLevel)}`}>
                          {fund.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min SIP:</span>
                        <span className="font-medium">{formatCurrency(fund.sipMinimum)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" className="bg-gradient-primary">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Invest Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Funds
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Funds;