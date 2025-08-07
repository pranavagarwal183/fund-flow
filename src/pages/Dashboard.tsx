import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  PieChart,
  Target,
  Calendar,
  Bell,
  BarChart3,
  DollarSign,
  TrendingDown,
  Users,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);

  const portfolioData = {
    currentValue: 245750,
    totalInvested: 218500,
    totalGains: 27250,
    gainsPercentage: 12.47,
    todayChange: 1850,
    todayChangePercentage: 0.76
  };

  const holdings = [
    {
      name: "HDFC Top 100 Fund",
      type: "Large Cap",
      invested: 50000,
      current: 58750,
      gains: 8750,
      gainsPercentage: 17.5,
      units: 245.67,
      nav: 239.15
    },
    {
      name: "Axis Midcap Fund",
      type: "Mid Cap",
      invested: 40000,
      current: 46200,
      gains: 6200,
      gainsPercentage: 15.5,
      units: 189.23,
      nav: 244.12
    },
    {
      name: "ICICI Prudential Bluechip",
      type: "Large Cap",
      invested: 60000,
      current: 65800,
      gains: 5800,
      gainsPercentage: 9.67,
      units: 312.45,
      nav: 210.56
    },
    {
      name: "SBI Small Cap Fund",
      type: "Small Cap",
      invested: 35000,
      current: 38500,
      gains: 3500,
      gainsPercentage: 10.0,
      units: 156.78,
      nav: 245.67
    },
    {
      name: "UTI Nifty Index Fund",
      type: "Index",
      invested: 33500,
      current: 36500,
      gains: 3000,
      gainsPercentage: 8.96,
      units: 278.91,
      nav: 130.89
    }
  ];

  const goals = [
    {
      name: "Emergency Fund",
      target: 600000,
      current: 245000,
      progress: 40.83,
      timeLeft: "8 months",
      icon: Shield
    },
    {
      name: "House Down Payment",
      target: 1500000,
      current: 380000,
      progress: 25.33,
      timeLeft: "3 years",
      icon: Target
    },
    {
      name: "Child Education",
      target: 2500000,
      current: 125000,
      progress: 5.0,
      timeLeft: "12 years",
      icon: Users
    }
  ];

  const formatCurrency = (amount: number) => {
    if (!showBalance) return "₹ ****";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        {/* Welcome Section */}
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Welcome back, Rahul! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your investment portfolio overview
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" size="sm" className="micro-press">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button size="sm" className="bg-gradient-primary micro-press" asChild>
              <Link to="/funds">
                <Plus className="h-4 w-4 mr-2" />
                New Investment
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Portfolio Overview Cards */}
        <motion.div 
          className="grid lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          <Card className="lg:col-span-2 shadow-soft card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                Portfolio Value
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="micro-press"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {formatCurrency(portfolioData.currentValue)}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-success">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+{formatCurrency(portfolioData.totalGains)} ({portfolioData.gainsPercentage}%)</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span>Today: +{formatCurrency(portfolioData.todayChange)} ({portfolioData.todayChangePercentage}%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link to="/funds">
            <Card className="shadow-soft card-hover">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Total Invested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(portfolioData.totalInvested)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Click to view funds</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="shadow-soft card-hover">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-secondary" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Equity</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Debt</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Others</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Click for detailed analysis</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Holdings */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-primary" />
                  My Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holdings.map((holding, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 card-hover"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">{holding.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {holding.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Units: {holding.units}</span>
                          <span>NAV: ₹{holding.nav}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-foreground mb-1">
                          {formatCurrency(holding.current)}
                        </div>
                        <div className="flex items-center text-sm">
                          {holding.gains >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1 text-success" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1 text-destructive" />
                          )}
                          <span className={holding.gains >= 0 ? "text-success" : "text-destructive"}>
                            {formatCurrency(Math.abs(holding.gains))} ({Math.abs(holding.gainsPercentage)}%)
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Goals & Actions */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            {/* Goals */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Financial Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal, index) => {
                    const IconComponent = goal.icon;
                    return (
                      <motion.div 
                        key={index} 
                        className="space-y-2 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground text-sm">{goal.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="progress-animate" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                          <span>{goal.timeLeft}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full mt-4 micro-press" size="sm" asChild>
                  <Link to="/goals">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Goal
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start micro-press" variant="outline" asChild>
                  <Link to="/funds">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New SIP
                  </Link>
                </Button>
                <Button className="w-full justify-start micro-press" variant="outline" asChild>
                  <Link to="/funds">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    One-time Investment
                  </Link>
                </Button>
                <Button className="w-full justify-start micro-press" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start micro-press" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Alerts
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;