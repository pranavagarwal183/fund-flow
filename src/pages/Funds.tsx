import { useState, useEffect } from "react";

interface Fund {
  id: number;
  name: string;
  category: string;
  rating: number;
  nav: number;
  returns: {
    "1Y": number;
    "3Y": number;
    "5Y": number;
  };
  expenseRatio: number;
  aum: string;
  riskLevel: string;
  minInvestment: number;
  sipMinimum: number;
  isRecommended: boolean;
}
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
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch funds data from API
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.mfapi.in/mf');
        if (!response.ok) {
          throw new Error('Failed to fetch funds data');
        }
        const fundsData = await response.json();
        
        // Transform API data to match our component structure
        const transformedFunds = fundsData.slice(0, 20).map((fund, index) => ({
          id: fund.schemeCode || index + 1,
          name: fund.schemeName,
          category: categorizeScheme(fund.schemeName),
          rating: Math.floor(Math.random() * 3) + 3, // Random rating 3-5
          nav: 0, // Will be fetched separately
          returns: {
            "1Y": parseFloat((Math.random() * 20 + 5).toFixed(2)),
            "3Y": parseFloat((Math.random() * 15 + 8).toFixed(2)),
            "5Y": parseFloat((Math.random() * 12 + 6).toFixed(2))
          },
          expenseRatio: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          aum: `₹${(Math.random() * 50000 + 1000).toFixed(0)} Cr`,
          riskLevel: getRiskLevel(fund.schemeName),
          minInvestment: 500,
          sipMinimum: 500,
          isRecommended: Math.random() > 0.7
        }));

        // Fetch NAV data for first few funds
        const fundsWithNav = await Promise.all(
          transformedFunds.slice(0, 10).map(async (fund) => {
            try {
              const navResponse = await fetch(`https://api.mfapi.in/mf/${fund.id}`);
              if (navResponse.ok) {
                const navData = await navResponse.json();
                const latestNav = navData.data && navData.data[0] ? parseFloat(navData.data[0].nav) : 0;
                return { ...fund, nav: latestNav || parseFloat((Math.random() * 300 + 50).toFixed(2)) };
              }
              return { ...fund, nav: parseFloat((Math.random() * 300 + 50).toFixed(2)) };
            } catch {
              return { ...fund, nav: parseFloat((Math.random() * 300 + 50).toFixed(2)) };
            }
          })
        );

        setFunds(fundsWithNav);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching funds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, []);

  // Helper function to categorize schemes
  const categorizeScheme = (schemeName: string) => {
    const name = schemeName.toLowerCase();
    if (name.includes('large') || name.includes('bluechip') || name.includes('top')) return 'Large Cap';
    if (name.includes('mid') || name.includes('midcap')) return 'Mid Cap';
    if (name.includes('small') || name.includes('smallcap')) return 'Small Cap';
    if (name.includes('index') || name.includes('nifty') || name.includes('sensex')) return 'Index';
    if (name.includes('multi') || name.includes('flexi')) return 'Multi Cap';
    if (name.includes('debt') || name.includes('bond')) return 'Debt';
    if (name.includes('hybrid') || name.includes('balanced')) return 'Hybrid';
    return 'Equity';
  };

  // Helper function to determine risk level
  const getRiskLevel = (schemeName: string) => {
    const name = schemeName.toLowerCase();
    if (name.includes('small') || name.includes('emerging')) return 'Very High';
    if (name.includes('mid') || name.includes('growth')) return 'High';
    if (name.includes('large') || name.includes('bluechip')) return 'Moderate';
    if (name.includes('debt') || name.includes('liquid')) return 'Low';
    if (name.includes('index')) return 'Moderate';
    return 'Moderate';
  };

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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading funds data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="shadow-soft border-destructive/20">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Error loading funds: {error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Fund List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredFunds.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No funds found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredFunds.map((fund) => (
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
              ))
            )}
          </div>
        )}

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