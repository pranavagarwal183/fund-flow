import { useState } from "react";
import { motion } from "framer-motion";
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Download,
  Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const PortfolioAnalysis = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("1Y");

  // Asset Allocation Data
  const assetAllocationData = [
    { name: "Equity", value: 75, color: "#3B82F6" },
    { name: "Debt", value: 20, color: "#10B981" },
    { name: "Others", value: 5, color: "#F59E0B" }
  ];

  // Performance Data
  const performanceData = [
    { month: "Jan", returns: 2.5, benchmark: 2.1 },
    { month: "Feb", returns: 1.8, benchmark: 1.9 },
    { month: "Mar", returns: 3.2, benchmark: 2.8 },
    { month: "Apr", returns: -0.5, benchmark: -0.3 },
    { month: "May", returns: 2.1, benchmark: 1.8 },
    { month: "Jun", returns: 4.2, benchmark: 3.9 },
    { month: "Jul", returns: 1.9, benchmark: 2.2 },
    { month: "Aug", returns: 3.5, benchmark: 3.1 },
    { month: "Sep", returns: -1.2, benchmark: -0.8 },
    { month: "Oct", returns: 2.8, benchmark: 2.5 },
    { month: "Nov", returns: 3.9, benchmark: 3.6 },
    { month: "Dec", returns: 4.5, benchmark: 4.2 }
  ];

  // Top & Bottom Performers
  const topPerformers = [
    { name: "HDFC Top 100 Fund", returns: 17.5, category: "Large Cap" },
    { name: "Axis Midcap Fund", returns: 15.5, category: "Mid Cap" },
    { name: "ICICI Prudential Bluechip", returns: 9.67, category: "Large Cap" }
  ];

  const bottomPerformers = [
    { name: "SBI Small Cap Fund", returns: 10.0, category: "Small Cap" },
    { name: "UTI Nifty Index Fund", returns: 8.96, category: "Index" }
  ];

  // Risk Metrics
  const riskMetrics = {
    volatility: 12.5,
    sharpeRatio: 1.2,
    beta: 0.95,
    alpha: 2.1,
    maxDrawdown: -8.5
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Portfolio Analysis
              </h1>
              <p className="text-muted-foreground">
                Comprehensive insights into your investment portfolio performance
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="outline" size="sm" className="micro-press">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" className="micro-press">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div className="grid lg:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
          <Card className="shadow-soft card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                ₹2,45,750
              </div>
              <div className="flex items-center text-success text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+₹27,250 (12.47%)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-success" />
                YTD Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                18.5%
              </div>
              <div className="flex items-center text-success text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+2.3% vs Benchmark</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2 text-warning" />
                Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                Moderate
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <Info className="h-4 w-4 mr-1" />
                <span>Volatility: 12.5%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-secondary" />
                Investment Age
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                2.5 Years
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <span>Started: Jan 2022</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Asset Allocation */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <PieChart className="h-6 w-6 mr-2 text-primary" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={assetAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assetAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {assetAllocationData.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: asset.color }}
                        />
                        <span className="text-sm font-medium">{asset.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{asset.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Chart */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-primary" />
                  Performance vs Benchmark
                </CardTitle>
                <div className="flex space-x-2">
                  {["1M", "3M", "6M", "1Y", "3Y"].map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                      className="micro-press"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="returns" fill="#3B82F6" name="Portfolio" />
                      <Bar dataKey="benchmark" fill="#6B7280" name="Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performers */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-success" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((fund, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{fund.name}</div>
                        <div className="text-sm text-muted-foreground">{fund.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-success">
                          {formatPercentage(fund.returns)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Performers */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-destructive" />
                  Bottom Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bottomPerformers.map((fund, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{fund.name}</div>
                        <div className="text-sm text-muted-foreground">{fund.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-destructive">
                          {formatPercentage(fund.returns)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Risk Metrics */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Target className="h-6 w-6 mr-2 text-warning" />
                Risk Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {riskMetrics.volatility}%
                  </div>
                  <div className="text-sm text-muted-foreground">Volatility</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {riskMetrics.sharpeRatio}
                  </div>
                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {riskMetrics.beta}
                  </div>
                  <div className="text-sm text-muted-foreground">Beta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatPercentage(riskMetrics.alpha)}
                  </div>
                  <div className="text-sm text-muted-foreground">Alpha</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive mb-1">
                    {formatPercentage(riskMetrics.maxDrawdown)}
                  </div>
                  <div className="text-sm text-muted-foreground">Max Drawdown</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default PortfolioAnalysis; 