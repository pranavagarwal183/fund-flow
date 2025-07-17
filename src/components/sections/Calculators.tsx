import { useState } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Receipt,
  ArrowRight,
  Play,
  Clock,
  BookOpen,
  BarChart3,
  Users,
  Shield,
  DollarSign,
  Download,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export const Calculators = () => {
  const [activeTab, setActiveTab] = useState("calculators");
  
  // Calculator states
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12);
  const [sipStepUp, setSipStepUp] = useState(0);
  
  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpYears, setLumpYears] = useState(5);
  const [lumpRate, setLumpRate] = useState(12);
  
  const [goalType, setGoalType] = useState("retirement");
  const [goalAmount, setGoalAmount] = useState(1000000);
  const [goalYears, setGoalYears] = useState(10);
  const [goalRate, setGoalRate] = useState(12);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [inflationRate, setInflationRate] = useState(6);
  
  const [annualIncome, setAnnualIncome] = useState(1000000);
  const [taxInvestment, setTaxInvestment] = useState(150000);
  const [taxBracket, setTaxBracket] = useState(30);
  const [taxYears, setTaxYears] = useState(3);
  const [taxRate, setTaxRate] = useState(12);

  // SIP Calculation with step-up
  const calculateSIP = () => {
    const monthlyRate = sipRate / 100 / 12;
    const months = sipYears * 12;
    let totalInvested = 0;
    let futureValue = 0;
    
    for (let month = 1; month <= months; month++) {
      const yearNumber = Math.ceil(month / 12);
      const stepUpMultiplier = Math.pow(1 + sipStepUp / 100, yearNumber - 1);
      const monthlyAmount = sipAmount * stepUpMultiplier;
      
      totalInvested += monthlyAmount;
      const remainingMonths = months - month + 1;
      futureValue += monthlyAmount * Math.pow(1 + monthlyRate, remainingMonths - 1);
    }
    
    const gains = futureValue - totalInvested;
    return { futureValue, totalInvested, gains };
  };

  // Generate year-wise data for charts
  const generateSIPChartData = () => {
    const data = [];
    const monthlyRate = sipRate / 100 / 12;
    let totalInvested = 0;
    let totalValue = 0;
    
    for (let year = 1; year <= sipYears; year++) {
      for (let month = 1; month <= 12; month++) {
        const stepUpMultiplier = Math.pow(1 + sipStepUp / 100, year - 1);
        const monthlyAmount = sipAmount * stepUpMultiplier;
        totalInvested += monthlyAmount;
        totalValue = totalValue * (1 + monthlyRate) + monthlyAmount;
      }
      
      data.push({
        year: year,
        invested: totalInvested,
        value: totalValue,
        returns: totalValue - totalInvested
      });
    }
    
    return data;
  };

  // Lumpsum Calculation
  const calculateLumpsum = () => {
    const futureValue = lumpAmount * Math.pow(1 + lumpRate / 100, lumpYears);
    const gains = futureValue - lumpAmount;
    return { futureValue, totalInvested: lumpAmount, gains };
  };

  // Goal Calculation with inflation adjustment
  const calculateGoal = () => {
    const inflationAdjustedGoal = goalAmount * Math.pow(1 + inflationRate / 100, goalYears);
    const currentFutureValue = currentSavings * Math.pow(1 + goalRate / 100, goalYears);
    const remainingAmount = inflationAdjustedGoal - currentFutureValue;
    
    const monthlyRate = goalRate / 100 / 12;
    const months = goalYears * 12;
    const requiredSIP = remainingAmount / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    
    return { 
      requiredSIP: Math.max(0, requiredSIP), 
      inflationAdjustedGoal,
      currentFutureValue
    };
  };

  // Tax Savings Calculation
  const calculateTaxSavings = () => {
    const eligibleAmount = Math.min(taxInvestment, 150000);
    const taxSaved = eligibleAmount * (taxBracket / 100);
    const futureValue = taxInvestment * Math.pow(1 + taxRate / 100, taxYears);
    const gains = futureValue - taxInvestment;
    const netInvestment = taxInvestment - taxSaved;
    const effectiveReturn = ((futureValue - netInvestment) / netInvestment) * 100;
    
    return { 
      taxSaved, 
      futureValue, 
      gains, 
      netInvestment,
      effectiveReturn: effectiveReturn / taxYears
    };
  };

  const sipResult = calculateSIP();
  const lumpResult = calculateLumpsum();
  const goalResult = calculateGoal();
  const taxResult = calculateTaxSavings();
  const chartData = generateSIPChartData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  // Pie chart data for SIP breakdown
  const sipPieData = [
    { name: 'Invested', value: sipResult.totalInvested, color: '#3B82F6' },
    { name: 'Returns', value: sipResult.gains, color: '#10B981' }
  ];

  // Investment comparison data
  const comparisonData = [
    {
      type: "Mutual Funds",
      returns: "12-15%",
      liquidity: "High",
      risk: "Medium",
      minInvestment: "₹500",
      taxBenefits: "ELSS (80C)",
      inflationProtection: "Yes"
    },
    {
      type: "Fixed Deposits",
      returns: "6-7%",
      liquidity: "Medium",
      risk: "Low",
      minInvestment: "₹1,000",
      taxBenefits: "80TTB",
      inflationProtection: "No"
    },
    {
      type: "Real Estate",
      returns: "8-10%",
      liquidity: "Low",
      risk: "High",
      minInvestment: "₹25,00,000",
      taxBenefits: "54EC, 80C",
      inflationProtection: "Yes"
    },
    {
      type: "Gold",
      returns: "8-9%",
      liquidity: "High",
      risk: "Medium",
      minInvestment: "₹1,000",
      taxBenefits: "None",
      inflationProtection: "Yes"
    },
    {
      type: "PPF",
      returns: "7-8%",
      liquidity: "Low",
      risk: "Low",
      minInvestment: "₹500",
      taxBenefits: "80C, EEE",
      inflationProtection: "Partial"
    }
  ];

  // Educational videos data
  const educationalVideos = [
    {
      title: "What are Mutual Funds?",
      duration: "5:30",
      thumbnail: "/placeholder.svg",
      description: "Basic introduction to mutual funds and how they work"
    },
    {
      title: "SIP vs Lumpsum Investment",
      duration: "7:45",
      thumbnail: "/placeholder.svg",
      description: "Comparison between systematic and lumpsum investments"
    },
    {
      title: "Understanding Risk & Returns",
      duration: "6:20",
      thumbnail: "/placeholder.svg",
      description: "Learn about different risk levels and expected returns"
    },
    {
      title: "Tax Benefits of Mutual Funds",
      duration: "4:15",
      thumbnail: "/placeholder.svg",
      description: "How to save taxes through ELSS and other schemes"
    }
  ];

  // Recent articles data
  const recentArticles = [
    {
      title: "Top Performing Equity Funds in 2024",
      excerpt: "Discover which equity mutual funds delivered exceptional returns this year and what makes them stand out.",
      readTime: "5 min",
      author: "Financial Expert",
      date: "Dec 15, 2024",
      category: "Fund Performance"
    },
    {
      title: "New SEBI Guidelines: What Investors Need to Know",
      excerpt: "Recent regulatory changes affecting mutual fund investments and their impact on your portfolio.",
      readTime: "7 min",
      author: "Compliance Expert",
      date: "Dec 12, 2024",
      category: "Regulatory Changes"
    },
    {
      title: "SIP vs Lumpsum: Which Strategy Works Better?",
      excerpt: "Comprehensive analysis of investment strategies based on market conditions and investor goals.",
      readTime: "6 min",
      author: "Investment Advisor",
      date: "Dec 10, 2024",
      category: "Investment Tips"
    },
    {
      title: "Tax Planning with ELSS Funds",
      excerpt: "Maximize your tax savings while building wealth through equity-linked savings schemes.",
      readTime: "4 min",
      author: "Tax Consultant",
      date: "Dec 8, 2024",
      category: "Tax Updates"
    },
    {
      title: "Understanding Fund Expense Ratios",
      excerpt: "How expense ratios impact your returns and what to look for when selecting funds.",
      readTime: "5 min",
      author: "Fund Analyst",
      date: "Dec 5, 2024",
      category: "Market Analysis"
    },
    {
      title: "Market Volatility: Should You Pause Your SIP?",
      excerpt: "Expert advice on managing investments during volatile market conditions.",
      readTime: "8 min",
      author: "Market Strategist",
      date: "Dec 3, 2024",
      category: "Investment Tips"
    }
  ];

  // Investment tips
  const investmentTips = [
    "Start early to benefit from compounding",
    "Diversify across different fund categories",
    "Don't time the market, invest regularly",
    "Review and rebalance your portfolio annually",
    "Consider tax-saving funds for Section 80C"
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Investment Calculators & Education Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Make informed investment decisions with our comprehensive tools and educational resources
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="calculators" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculators
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Education
              </TabsTrigger>
              <TabsTrigger value="comparisons" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Comparisons
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recent Articles
              </TabsTrigger>
            </TabsList>

            {/* Calculators Tab */}
            <TabsContent value="calculators">
              <Tabs defaultValue="sip" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="sip" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    SIP Calculator
                  </TabsTrigger>
                  <TabsTrigger value="lumpsum" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Lumpsum
                  </TabsTrigger>
                  <TabsTrigger value="goal" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Goal Planning
                  </TabsTrigger>
                  <TabsTrigger value="tax" className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Tax Savings
                  </TabsTrigger>
                </TabsList>

                {/* SIP Calculator */}
                <TabsContent value="sip">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          SIP Calculator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label>Monthly Investment: ₹{formatNumber(sipAmount)}</Label>
                          <Slider
                            value={[sipAmount]}
                            onValueChange={(value) => setSipAmount(value[0])}
                            max={100000}
                            min={500}
                            step={500}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>₹500</span>
                            <span>₹1,00,000</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Investment Duration: {sipYears} years</Label>
                          <Slider
                            value={[sipYears]}
                            onValueChange={(value) => setSipYears(value[0])}
                            max={30}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>1 year</span>
                            <span>30 years</span>
                          </div>
                        </div>

                        <div>
                          <Label>Expected Return: {sipRate}% per annum</Label>
                          <Slider
                            value={[sipRate]}
                            onValueChange={(value) => setSipRate(value[0])}
                            max={15}
                            min={8}
                            step={0.5}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>8%</span>
                            <span>15%</span>
                          </div>
                        </div>

                        <div>
                          <Label>Step-up Percentage: {sipStepUp}% annually</Label>
                          <Slider
                            value={[sipStepUp]}
                            onValueChange={(value) => setSipStepUp(value[0])}
                            max={20}
                            min={0}
                            step={1}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>0%</span>
                            <span>20%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card className="bg-gradient-primary text-primary-foreground">
                        <CardHeader>
                          <CardTitle>Investment Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Future Value</span>
                            <span className="font-bold text-xl">{formatCurrency(sipResult.futureValue)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Total Invested</span>
                            <span className="font-medium">{formatCurrency(sipResult.totalInvested)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Total Gains</span>
                            <span className="font-bold">{formatCurrency(sipResult.gains)}</span>
                          </div>
                          <Button className="w-full mt-4 bg-white text-primary hover:bg-white/90">
                            <Download className="mr-2 h-4 w-4" />
                            Export Results
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Growth Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Growth Projection</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis />
                              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                              <Line type="monotone" dataKey="invested" stroke="#8884d8" name="Invested" />
                              <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Total Value" />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Pie Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Investment Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={sipPieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {sipPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Lumpsum Calculator */}
                <TabsContent value="lumpsum">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          Lumpsum Calculator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label>Investment Amount: ₹{formatNumber(lumpAmount)}</Label>
                          <Slider
                            value={[lumpAmount]}
                            onValueChange={(value) => setLumpAmount(value[0])}
                            max={10000000}
                            min={10000}
                            step={10000}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>₹10,000</span>
                            <span>₹1,00,00,000</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Investment Duration: {lumpYears} years</Label>
                          <Slider
                            value={[lumpYears]}
                            onValueChange={(value) => setLumpYears(value[0])}
                            max={30}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Expected Return: {lumpRate}% per annum</Label>
                          <Slider
                            value={[lumpRate]}
                            onValueChange={(value) => setLumpRate(value[0])}
                            max={15}
                            min={8}
                            step={0.5}
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-secondary text-secondary-foreground">
                      <CardHeader>
                        <CardTitle>Investment Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Future Value</span>
                          <span className="font-bold text-xl">{formatCurrency(lumpResult.futureValue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Amount Invested</span>
                          <span className="font-medium">{formatCurrency(lumpResult.totalInvested)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Total Gains</span>
                          <span className="font-bold">{formatCurrency(lumpResult.gains)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Returns Multiple</span>
                          <span className="font-medium">{(lumpResult.futureValue / lumpResult.totalInvested).toFixed(2)}x</span>
                        </div>
                        <Button className="w-full mt-4 bg-white text-secondary hover:bg-white/90">
                          <Download className="mr-2 h-4 w-4" />
                          Export Results
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Goal Planning Calculator */}
                <TabsContent value="goal">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Goal Planning Calculator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label htmlFor="goal-type">Financial Goal</Label>
                          <Select value={goalType} onValueChange={setGoalType}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retirement">Retirement</SelectItem>
                              <SelectItem value="education">Child Education</SelectItem>
                              <SelectItem value="house">House Purchase</SelectItem>
                              <SelectItem value="car">Car Purchase</SelectItem>
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="emergency">Emergency Fund</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Target Amount: ₹{formatNumber(goalAmount)}</Label>
                          <Slider
                            value={[goalAmount]}
                            onValueChange={(value) => setGoalAmount(value[0])}
                            max={50000000}
                            min={100000}
                            step={100000}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Time to Goal: {goalYears} years</Label>
                          <Slider
                            value={[goalYears]}
                            onValueChange={(value) => setGoalYears(value[0])}
                            max={30}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Current Savings: ₹{formatNumber(currentSavings)}</Label>
                          <Slider
                            value={[currentSavings]}
                            onValueChange={(value) => setCurrentSavings(value[0])}
                            max={goalAmount}
                            min={0}
                            step={10000}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Expected Return: {goalRate}%</Label>
                          <Slider
                            value={[goalRate]}
                            onValueChange={(value) => setGoalRate(value[0])}
                            max={15}
                            min={8}
                            step={0.5}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Inflation Rate: {inflationRate}%</Label>
                          <Slider
                            value={[inflationRate]}
                            onValueChange={(value) => setInflationRate(value[0])}
                            max={8}
                            min={3}
                            step={0.5}
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-warning to-warning/80 text-warning-foreground">
                      <CardHeader>
                        <CardTitle>Goal Planning Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm opacity-90 mb-2">Monthly SIP Required</p>
                          <p className="font-bold text-3xl">{formatCurrency(goalResult.requiredSIP)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Inflation Adjusted Goal</span>
                          <span className="font-medium">{formatCurrency(goalResult.inflationAdjustedGoal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Current Savings Future Value</span>
                          <span className="font-medium">{formatCurrency(goalResult.currentFutureValue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Time to Goal</span>
                          <span className="font-medium">{goalYears} years</span>
                        </div>
                        <Button className="w-full mt-4 bg-white text-warning hover:bg-white/90">
                          Start Goal-Based SIP
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tax Savings Calculator */}
                <TabsContent value="tax">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-primary" />
                          Tax Savings Calculator (ELSS)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label>Annual Income: ₹{formatNumber(annualIncome)}</Label>
                          <Slider
                            value={[annualIncome]}
                            onValueChange={(value) => setAnnualIncome(value[0])}
                            max={10000000}
                            min={300000}
                            step={50000}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>ELSS Investment: ₹{formatNumber(taxInvestment)}</Label>
                          <Slider
                            value={[taxInvestment]}
                            onValueChange={(value) => setTaxInvestment(value[0])}
                            max={150000}
                            min={500}
                            step={500}
                            className="mt-2"
                          />
                          <p className="text-sm text-muted-foreground mt-1">Maximum ₹1,50,000 under Section 80C</p>
                        </div>

                        <div>
                          <Label htmlFor="tax-bracket">Tax Bracket (%)</Label>
                          <Select value={taxBracket.toString()} onValueChange={(value) => setTaxBracket(Number(value))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5% (₹2.5L - ₹5L)</SelectItem>
                              <SelectItem value="20">20% (₹5L - ₹10L)</SelectItem>
                              <SelectItem value="30">30% (Above ₹10L)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Investment Period: {taxYears} years</Label>
                          <Slider
                            value={[taxYears]}
                            onValueChange={(value) => setTaxYears(value[0])}
                            max={15}
                            min={3}
                            step={1}
                            className="mt-2"
                          />
                          <p className="text-sm text-muted-foreground mt-1">Minimum 3 years lock-in period</p>
                        </div>

                        <div>
                          <Label>Expected Return: {taxRate}%</Label>
                          <Slider
                            value={[taxRate]}
                            onValueChange={(value) => setTaxRate(value[0])}
                            max={15}
                            min={8}
                            step={0.5}
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-success to-success/80 text-success-foreground">
                      <CardHeader>
                        <CardTitle>Tax Savings Benefits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Immediate Tax Saved</span>
                          <span className="font-bold text-xl">{formatCurrency(taxResult.taxSaved)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Net Investment Cost</span>
                          <span className="font-medium">{formatCurrency(taxResult.netInvestment)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Future Value</span>
                          <span className="font-medium">{formatCurrency(taxResult.futureValue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Capital Gains</span>
                          <span className="font-medium">{formatCurrency(taxResult.gains)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-bold">Effective Annual Return</span>
                          <span className="font-bold text-xl">{taxResult.effectiveReturn.toFixed(1)}%</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-md">
                          <p className="text-sm">
                            <strong>Lock-in Period:</strong> {taxYears} years (ELSS requirement)
                          </p>
                        </div>
                        <Button className="w-full mt-4 bg-white text-success hover:bg-white/90">
                          Start ELSS Investment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education">
              <div className="space-y-12">
                {/* Educational Videos */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Mutual Fund Awareness & Education</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {educationalVideos.map((video, index) => (
                      <Card key={index} className="group cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-40 object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {video.duration}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{video.title}</h4>
                          <p className="text-sm text-muted-foreground">{video.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quick Tips */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Smart Investment Tips</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {investmentTips.map((tip, index) => (
                      <Card key={index} className="p-4 text-center">
                        <p className="text-sm font-medium">{tip}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is the minimum amount to start SIP?</AccordionTrigger>
                      <AccordionContent>
                        Most mutual funds allow you to start SIP with as low as ₹500 per month. However, some funds may have higher minimum amounts like ₹1,000 or ₹5,000.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Can I modify my SIP amount?</AccordionTrigger>
                      <AccordionContent>
                        Yes, you can increase or decrease your SIP amount. Most fund houses allow you to step up your SIP annually. To decrease, you may need to cancel the existing SIP and start a new one.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>How are mutual fund returns calculated?</AccordionTrigger>
                      <AccordionContent>
                        Mutual fund returns are calculated based on the Net Asset Value (NAV). The return is the difference between the purchase NAV and current/selling NAV, expressed as a percentage.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>What happens if I miss a SIP payment?</AccordionTrigger>
                      <AccordionContent>
                        If you miss a SIP payment, that month's investment won't happen, but your SIP continues. After 3 consecutive missed payments, the SIP may be auto-cancelled by the AMC.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger>Are mutual funds better than FDs?</AccordionTrigger>
                      <AccordionContent>
                        Mutual funds typically offer higher returns than FDs over the long term but come with market risk. FDs provide assured returns with capital protection. Choose based on your risk appetite and goals.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </TabsContent>

            {/* Comparisons Tab */}
            <TabsContent value="comparisons">
              <div>
                <h3 className="text-2xl font-bold mb-6">Mutual Funds vs Other Investment Options</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Investment Type</th>
                        <th className="text-left p-4 font-semibold">Returns</th>
                        <th className="text-left p-4 font-semibold">Liquidity</th>
                        <th className="text-left p-4 font-semibold">Risk Level</th>
                        <th className="text-left p-4 font-semibold">Min Investment</th>
                        <th className="text-left p-4 font-semibold">Tax Benefits</th>
                        <th className="text-left p-4 font-semibold">Inflation Protection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((item, index) => (
                        <tr key={index} className={`border-b hover:bg-muted/50 ${index === 0 ? 'bg-primary/5' : ''}`}>
                          <td className="p-4 font-medium">{item.type}</td>
                          <td className="p-4">{item.returns}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.liquidity === 'High' ? 'bg-green-100 text-green-800' :
                              item.liquidity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.liquidity}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.risk === 'Low' ? 'bg-green-100 text-green-800' :
                              item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.risk}
                            </span>
                          </td>
                          <td className="p-4">{item.minInvestment}</td>
                          <td className="p-4">{item.taxBenefits}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.inflationProtection === 'Yes' ? 'bg-green-100 text-green-800' :
                              item.inflationProtection === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.inflationProtection}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Performance Chart */}
                <div className="mt-8">
                  <h4 className="text-xl font-semibold mb-4">Historical Performance Comparison</h4>
                  <Card>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { name: 'Mutual Funds', returns: 13.5 },
                          { name: 'Fixed Deposits', returns: 6.5 },
                          { name: 'Real Estate', returns: 9 },
                          { name: 'Gold', returns: 8.5 },
                          { name: 'PPF', returns: 7.5 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="returns" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles">
              <div>
                <h3 className="text-2xl font-bold mb-6">Latest Mutual Fund Insights & Market Updates</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentArticles.map((article, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {article.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{article.date}</span>
                        </div>
                        <h4 className="font-semibold mb-2 line-clamp-2">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By {article.author}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 p-6 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Important Disclaimers</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Mutual fund investments are subject to market risks. Please read all scheme related documents carefully.</li>
            <li>• Past performance is not indicative of future results.</li>
            <li>• Calculator results are estimates based on the inputs provided and actual returns may vary.</li>
            <li>• Please consult your financial advisor before making investment decisions.</li>
            <li>• Tax benefits are subject to applicable tax laws and individual circumstances.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};