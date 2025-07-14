import { useState } from "react";
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
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      timeLeft: "8 months"
    },
    {
      name: "House Down Payment",
      target: 1500000,
      current: 380000,
      progress: 25.33,
      timeLeft: "3 years"
    },
    {
      name: "Child Education",
      target: 2500000,
      current: 125000,
      progress: 5.0,
      timeLeft: "12 years"
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Welcome back, Rahul! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your investment portfolio overview
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Investment
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Portfolio Value</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
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

          <Card className="shadow-soft">
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
            </CardContent>
          </Card>

          <Card className="shadow-soft">
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
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Holdings */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">My Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holdings.map((holding, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals & Actions */}
          <div className="space-y-6">
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
                  {goals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground text-sm">{goal.name}</span>
                        <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                        <span>{goal.timeLeft}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Goal
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Start New SIP
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  One-time Investment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;