import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  Eye,
  Loader2,
  AlertTriangle,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PortfolioHolding {
  id: string;
  scheme_id: string;
  total_units: number;
  total_invested_amount: number;
  average_nav: number;
  current_value: number;
  unrealized_gain_loss: number;
  scheme_name: string;
  scheme_category: string;
  current_nav: number;
  expense_ratio: number;
  risk_level: string;
}

interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_gains: number;
  percentage_gain: number;
}

const Portfolio = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setError("Please log in to view your portfolio");
      setLoading(false);
      return;
    }

    fetchPortfolioData();
  }, [user, authLoading]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch portfolio holdings with fund details
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select(`
          id,
          scheme_id,
          total_units,
          total_invested_amount,
          average_nav,
          current_value,
          unrealized_gain_loss,
          mutual_fund_schemes (
            scheme_name,
            fund_category,
            current_nav,
            expense_ratio,
            risk_level
          )
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (portfolioError) throw portfolioError;

      // Transform the data
      const transformedHoldings: PortfolioHolding[] = (portfolioData || []).map(holding => ({
        id: holding.id,
        scheme_id: holding.scheme_id,
        total_units: holding.total_units || 0,
        total_invested_amount: holding.total_invested_amount || 0,
        average_nav: holding.average_nav || 0,
        current_value: holding.current_value || 0,
        unrealized_gain_loss: holding.unrealized_gain_loss || 0,
        scheme_name: holding.mutual_fund_schemes?.scheme_name || 'Unknown Fund',
        scheme_category: holding.mutual_fund_schemes?.fund_category || 'Unknown',
        current_nav: holding.mutual_fund_schemes?.current_nav || 0,
        expense_ratio: holding.mutual_fund_schemes?.expense_ratio || 0,
        risk_level: holding.mutual_fund_schemes?.risk_level || 'Unknown'
      }));

      // Calculate portfolio summary
      const totalInvested = transformedHoldings.reduce((sum, h) => sum + h.total_invested_amount, 0);
      const currentValue = transformedHoldings.reduce((sum, h) => 
        sum + (h.total_units * h.current_nav), 0
      );
      const totalGains = currentValue - totalInvested;
      const percentageGain = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

      setSummary({
        total_invested: totalInvested,
        current_value: currentValue,
        total_gains: totalGains,
        percentage_gain: percentageGain
      });

      setHoldings(transformedHoldings);
    } catch (err: any) {
      setError(err.message || "Failed to fetch portfolio data");
      toast({
        title: "Error",
        description: "Failed to load your portfolio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-500";
      case "Moderate": return "text-yellow-500";
      case "High": return "text-orange-500";
      case "Very High": return "text-red-500";
      default: return "text-gray-500";
    }
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

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center flex-1">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Loading your portfolio...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Portfolio</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPortfolioData}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <motion.main 
        className="container mx-auto px-4 py-8 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
          <p className="text-muted-foreground">Track your mutual fund investments and performance</p>
        </motion.div>

        {/* Portfolio Summary Cards */}
        {summary && (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
            <Card className="shadow-soft card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_invested)}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.current_value)}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gains</CardTitle>
                {summary.total_gains >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.total_gains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.total_gains)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returns %</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.percentage_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(summary.percentage_gain)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Holdings List */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <div className="text-center py-16">
                  <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No investments yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your investment journey by exploring our fund recommendations
                  </p>
                  <Button onClick={() => window.location.href = '/watchlist'}>
                    Explore Funds
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {holdings.map((holding) => {
                      const currentValue = holding.total_units * holding.current_nav;
                      const gainLoss = currentValue - holding.total_invested_amount;
                      const gainLossPercent = holding.total_invested_amount > 0 
                        ? (gainLoss / holding.total_invested_amount) * 100 
                        : 0;

                      return (
                        <motion.div
                          key={holding.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="grid lg:grid-cols-12 gap-4 items-center">
                            {/* Fund Info */}
                            <div className="lg:col-span-4">
                              <h3 className="font-semibold text-foreground mb-1">{holding.scheme_name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Badge variant="outline">{holding.scheme_category}</Badge>
                                <span className={getRiskColor(holding.risk_level)}>{holding.risk_level}</span>
                              </div>
                            </div>

                            {/* Units & NAV */}
                            <div className="lg:col-span-2 text-sm">
                              <div className="text-muted-foreground">Units</div>
                              <div className="font-medium">{holding.total_units.toFixed(3)}</div>
                              <div className="text-muted-foreground mt-1">Current NAV: ₹{holding.current_nav}</div>
                            </div>

                            {/* Investment */}
                            <div className="lg:col-span-2 text-sm">
                              <div className="text-muted-foreground">Invested</div>
                              <div className="font-medium">{formatCurrency(holding.total_invested_amount)}</div>
                              <div className="text-muted-foreground mt-1">Avg NAV: ₹{holding.average_nav}</div>
                            </div>

                            {/* Current Value */}
                            <div className="lg:col-span-2 text-sm">
                              <div className="text-muted-foreground">Current Value</div>
                              <div className="font-medium">{formatCurrency(currentValue)}</div>
                            </div>

                            {/* Gains/Loss */}
                            <div className="lg:col-span-2 text-sm">
                              <div className="text-muted-foreground">Gains/Loss</div>
                              <div className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(gainLoss)}
                              </div>
                              <div className={`text-sm ${gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(gainLossPercent)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default Portfolio;