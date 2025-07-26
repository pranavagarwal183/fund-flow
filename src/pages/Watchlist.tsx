import { useState, useEffect, useMemo } from "react";
import {
  Search,
  TrendingUp,
  Star,
  Eye,
  ShoppingCart,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface Fund {
  id: number | string;
  name: string;
  category: string;
  rating: number;
  nav: number;
  returns: { "1Y": number; "3Y": number; "5Y": number };
  expenseRatio: number;
  aum: string;
  riskLevel: string;
  minInvestment: number;
  sipMinimum: number;
  isRecommended: boolean;
}

const trendingFundNames = ["ICICI", "HDFC", "Axis", "SBI", "Kotak"];

const Funds = () => {
  const [allFunds, setAllFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const apiKey = import.meta.env.VITE_INDIAN_STOCK_API_KEY;

  // 🔁 Fetch trending funds on first load
  useEffect(() => {
    const fetchTrendingFunds = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!apiKey) throw new Error("API key missing in .env");

        const fetchedFunds: Fund[] = [];

        for (const name of trendingFundNames) {
          const res = await fetch(`https://stock.indianapi.in/mutual_funds_details?stock_name=${name}`, {
            headers: { "x-api-key": apiKey }
          });

          if (!res.ok) continue;

          const data = await res.json();

          const fund: Fund = {
            id: data.basic_info.fund_name,
            name: data.basic_info.fund_name,
            category: data.basic_info.category,
            rating: Math.round(data.returns.risk_metrics?.risk_rating || 0),
            nav: data.nav_info.current_nav,
            returns: {
              "1Y": data.returns.absolute["1y"] || 0,
              "3Y": data.returns.cagr["3y"] || 0,
              "5Y": data.returns.cagr["5y"] || 0,
            },
            expenseRatio: data.expense_ratio.current || 0,
            aum: `₹${Math.round(data.basic_info.fund_size).toLocaleString()} Cr`,
            riskLevel: data.basic_info.risk_level.replace(" Risk", ""),
            minInvestment: 500,
            sipMinimum: 500,
            isRecommended: data.returns.cagr["5y"] > 20 && data.expense_ratio.current < 1.5,
          };

          fetchedFunds.push(fund);
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

        const res = await fetch(`https://stock.indianapi.in/mutual_funds_details?stock_name=${searchTerm}`, {
          headers: { "x-api-key": apiKey }
        });

        if (!res.ok) throw new Error("Search failed or no results.");

        const data = await res.json();

        const fund: Fund = {
          id: data.basic_info.fund_name,
          name: data.basic_info.fund_name,
          category: data.basic_info.category,
          rating: Math.round(data.returns.risk_metrics?.risk_rating || 0),
          nav: data.nav_info.current_nav,
          returns: {
            "1Y": data.returns.absolute["1y"] || 0,
            "3Y": data.returns.cagr["3y"] || 0,
            "5Y": data.returns.cagr["5y"] || 0,
          },
          expenseRatio: data.expense_ratio.current || 0,
          aum: `₹${Math.round(data.basic_info.fund_size).toLocaleString()} Cr`,
          riskLevel: data.basic_info.risk_level.replace(" Risk", ""),
          minInvestment: 500,
          sipMinimum: 500,
          isRecommended: data.returns.cagr["5y"] > 20 && data.expense_ratio.current < 1.5,
        };

        setAllFunds([fund]);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Explore Mutual Funds</h1>
          <p className="text-muted-foreground">Trending funds and search from Indian stock database</p>
        </div>

        {/* Search Input */}
        <Card className="shadow-soft mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search funds by company name (e.g., Nippon, Quant)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading and Error */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-4 text-lg text-muted-foreground">Loading Funds...</span>
          </div>
        )}
        {error && (
          <div className="flex flex-col justify-center items-center py-20 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="mt-4 text-lg font-medium text-destructive">Failed to load data</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Funds Display */}
        {!loading && !error && (
          <div className="space-y-4">
            {allFunds.length > 0 ? allFunds.map(fund => (
              <Card key={fund.id} className="shadow-soft hover:shadow-strong transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    {/* Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary/10 rounded-lg p-2"><TrendingUp className="h-6 w-6 text-primary" /></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground">{fund.name}</h3>
                            {fund.isRecommended && <Badge className="bg-primary text-primary-foreground">Recommended</Badge>}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <Badge variant="outline">{fund.category}</Badge>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < fund.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                              <span className="ml-1">({fund.rating})</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">NAV: ₹{fund.nav} | AUM: {fund.aum}</div>
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
                      <div className="flex justify-between"><span className="text-muted-foreground">Expense Ratio:</span><span className="font-medium">{fund.expenseRatio}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Risk Level:</span><span className={`font-medium ${getRiskColor(fund.riskLevel)}`}>{fund.riskLevel}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Min SIP:</span><span className="font-medium">{formatCurrency(fund.sipMinimum)}</span></div>
                    </div>

                    {/* Buttons */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" className="bg-gradient-primary"><ShoppingCart className="h-4 w-4 mr-2" />Invest Now</Button>
                        <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-2" />View Details</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No funds found. Try a different company name.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Funds;
