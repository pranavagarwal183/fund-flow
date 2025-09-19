import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  Star,
  Eye,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Plus,
  Heart,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface Fund {
  id: string;
  name: string;
  category: string;
  rating: number;
  nav: number;
  low52: number;
  high52: number;
  returns: { "1Y": number; "3Y": number; "5Y": number };
  expenseRatio: number;
  aum: string;
  riskLevel: string;
  isRecommended?: boolean;
}

type SortOption = "name" | "nav" | "high52" | "returns1Y";

const trendingFundNames = ["ICICI Mutual Fund", "HDFC Mutual Fund", "Axis Mutual Fund", "SBI Mutual Fund", "Kotak Mutual Fund"];

const Watchlist = () => {
  const [allFunds, setAllFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const { toast } = useToast();

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('fund-watchlist');
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(new Set(parsed));
      } catch (error) {
        console.warn('Failed to parse saved watchlist:', error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fund-watchlist', JSON.stringify(Array.from(watchlist)));
  }, [watchlist]);

  // Real-time API function to fetch fund data using Gemini
  const fetchFundData = async (fundName: string) => {
    const { data, error } = await supabase.functions.invoke('fetch-fund-data', {
      body: { fundName }
    });

    if (error) throw new Error(error.message || 'Failed to fetch fund data');
    if (!data.success) throw new Error(data.error || 'API request failed');
    
    return data.data;
  };

  // 🔁 Fetch trending funds on first load
  useEffect(() => {
    const fetchTrendingFunds = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedFunds: Fund[] = [];

        for (const name of trendingFundNames) {
          try {
            const data = await fetchFundData(name);
            
            // Add all funds returned by the API
            data.forEach((fund: any) => {
              const processedFund: Fund = {
                id: fund.id || fund.name,
                name: fund.name,
                category: fund.category,
                rating: fund.rating,
                nav: fund.nav,
                low52: fund.low52,
                high52: fund.high52,
                returns: fund.returns,
                expenseRatio: fund.expenseRatio,
                aum: fund.aum,
                riskLevel: fund.riskLevel,
                isRecommended: fund.returns["5Y"] > 15 && fund.expenseRatio < 2,
              };
              fetchedFunds.push(processedFund);
            });
          } catch (fundError) {
            console.warn(`Failed to fetch data for ${name}:`, fundError);
          }
        }

        if (fetchedFunds.length === 0) {
          throw new Error("No funds could be loaded from the trending list");
        }

        setAllFunds(fetchedFunds);
      } catch (err: any) {
        setError(err.message || "Failed to fetch trending funds.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingFunds();
  }, []);

  // 🔍 Search logic (debounced)
  useEffect(() => {
    if (!searchTerm) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchFundData(searchTerm);
        
        const processedFunds: Fund[] = data.map((fund: any) => ({
          id: fund.id || fund.name,
          name: fund.name,
          category: fund.category,
          rating: fund.rating,
          nav: fund.nav,
          low52: fund.low52,
          high52: fund.high52,
          returns: fund.returns,
          expenseRatio: fund.expenseRatio,
          aum: fund.aum,
          riskLevel: fund.riskLevel,
          isRecommended: fund.returns["5Y"] > 15 && fund.expenseRatio < 2,
        }));

        setAllFunds(processedFunds);
      } catch (err: any) {
        setError(err.message || "Error fetching searched fund.");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-500";
      case "Moderate": return "text-yellow-500";
      case "High": return "text-orange-500";
      case "Very High": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  // Get watchlisted funds from all funds
  const watchlistedFunds = useMemo(() => {
    return allFunds.filter(fund => watchlist.has(fund.id.toString()));
  }, [allFunds, watchlist]);

  // Sort function
  const sortFunds = (funds: Fund[], sortOption: SortOption) => {
    return [...funds].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "nav":
          return b.nav - a.nav;
        case "high52":
          return b.high52 - a.high52;
        case "returns1Y":
          return b.returns["1Y"] - a.returns["1Y"];
        default:
          return 0;
      }
    });
  };

  // Sorted watchlist
  const sortedWatchlist = useMemo(() => {
    return sortFunds(watchlistedFunds, sortBy);
  }, [watchlistedFunds, sortBy]);

  // Fund Card Component
  const FundCard = ({ fund, isInWatchlist, onToggleWatchlist, onInvestNow }: {
    fund: Fund;
    isInWatchlist: boolean;
    onToggleWatchlist: () => void;
    onInvestNow: () => void;
  }) => (
    <Card className="shadow-soft hover:shadow-hover transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary card-hover">
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Info */}
          <div className="lg:col-span-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 rounded-lg p-2 micro-hover">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-foreground">{fund.name}</h3>
                  {fund.isRecommended && (
                    <Badge className="bg-primary text-primary-foreground micro-hover">
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
                        className={`h-3 w-3 ${i < fund.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
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
                  <div className={`font-semibold ${return_ >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {return_ >= 0 ? '+' : ''}{return_}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Details */}
          <div className="lg:col-span-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expense Ratio:</span>
              <span className="font-medium">{fund.expenseRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Level:</span>
              <span className={`font-medium ${getRiskColor(fund.riskLevel)}`}>{fund.riskLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">52W Range:</span>
              <span className="font-medium">₹{fund.low52} - ₹{fund.high52}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="lg:col-span-2">
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm" 
                className="bg-gradient-primary micro-press"
                onClick={onInvestNow}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Invest Now
              </Button>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 micro-press"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className={`micro-press ${isInWatchlist ? 'text-red-500 hover:text-red-600' : ''}`}
                  onClick={onToggleWatchlist}
                >
                  <Heart className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleAddToWatchlist = (fund: Fund) => {
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(fund.id.toString())) {
      newWatchlist.delete(fund.id.toString());
      toast({
        title: "Removed from watchlist",
        description: `${fund.name} has been removed from your watchlist.`,
      });
    } else {
      newWatchlist.add(fund.id.toString());
      toast({
        title: "Added to watchlist",
        description: `${fund.name} has been added to your watchlist!`,
      });
    }
    setWatchlist(newWatchlist);
  };

  const handleInvestNow = (fund: Fund) => {
    toast({
      title: "Investment initiated",
      description: `Redirecting to investment page for ${fund.name}...`,
    });
    // Here you would typically redirect to an investment flow
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
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Discover Mutual Funds</h1>
          <p className="text-muted-foreground">Explore and search from our comprehensive fund database - no login required</p>
        </motion.div>

        {/* Search Input */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-soft mb-8 card-hover">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search funds by company name (e.g., Nippon, Quant)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 form-input"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Watchlist Section */}
        {sortedWatchlist.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-primary fill-current" />
                <h2 className="text-xl font-semibold text-foreground">My Watchlist ({sortedWatchlist.length})</h2>
              </div>
              <div className="flex items-center space-x-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Fund Name (A-Z)</SelectItem>
                    <SelectItem value="nav">NAV (High to Low)</SelectItem>
                    <SelectItem value="high52">52-Week High (High to Low)</SelectItem>
                    <SelectItem value="returns1Y">1Y Returns (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {sortedWatchlist.map((fund) => (
                <FundCard 
                  key={fund.id} 
                  fund={fund} 
                  isInWatchlist={true}
                  onToggleWatchlist={() => handleAddToWatchlist(fund)}
                  onInvestNow={() => handleInvestNow(fund)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading and Error */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-4 text-lg text-muted-foreground">Loading Funds...</span>
            </motion.div>
          )}
          {error && (
            <motion.div 
              className="flex flex-col justify-center items-center py-20 bg-red-50 dark:bg-red-900/10 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <p className="mt-4 text-lg font-medium text-destructive">Failed to load data</p>
              <p className="text-muted-foreground">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results / Trending Funds */}
        {!loading && !error && (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {searchTerm ? `Search Results for "${searchTerm}"` : "Trending Funds"}
              </h2>
              {allFunds.length > 0 && (
                <span className="text-muted-foreground text-sm">
                  {allFunds.length} fund{allFunds.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            <AnimatePresence>
              {allFunds.length > 0 ? allFunds.map((fund, index) => (
                <motion.div
                  key={fund.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <FundCard 
                    fund={fund}
                    isInWatchlist={watchlist.has(fund.id.toString())}
                    onToggleWatchlist={() => handleAddToWatchlist(fund)}
                    onInvestNow={() => handleInvestNow(fund)}
                  />
                </motion.div>
              )) : (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-lg text-muted-foreground">
                    {searchTerm ? "No funds found. Try a different search term." : "No trending funds available at the moment."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Watchlist;