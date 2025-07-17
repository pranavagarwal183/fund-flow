import { useState } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Receipt,
  ArrowRight,
  BarChart3,
  DollarSign,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export const CalculatorsOnly = () => {
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

  // Lumpsum calculation
  const calculateLumpsum = () => {
    const futureValue = lumpAmount * Math.pow(1 + lumpRate / 100, lumpYears);
    const gains = futureValue - lumpAmount;
    return { futureValue, totalInvested: lumpAmount, gains };
  };

  // Goal planning calculation
  const calculateGoal = () => {
    const inflationAdjustedGoal = goalAmount * Math.pow(1 + inflationRate / 100, goalYears);
    const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + goalRate / 100, goalYears);
    const remainingAmount = inflationAdjustedGoal - futureValueOfCurrentSavings;
    
    const monthlyRate = goalRate / 100 / 12;
    const months = goalYears * 12;
    
    const requiredSIP = remainingAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    const requiredLumpsum = remainingAmount / Math.pow(1 + goalRate / 100, goalYears);
    
    return { 
      inflationAdjustedGoal, 
      requiredSIP: Math.max(0, requiredSIP), 
      requiredLumpsum: Math.max(0, requiredLumpsum) 
    };
  };

  // Tax savings calculation
  const calculateTaxSavings = () => {
    const taxSavings = Math.min(taxInvestment, 150000) * (taxBracket / 100);
    const netInvestment = taxInvestment - taxSavings;
    const futureValue = taxInvestment * Math.pow(1 + taxRate / 100, taxYears);
    const effectiveReturn = ((futureValue - netInvestment) / netInvestment) * 100;
    
    return { taxSavings, netInvestment, futureValue, effectiveReturn };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  // Chart colors
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Comparison data
  const investmentComparison = [
    {
      option: "Mutual Funds (Equity)",
      returns: "12-15%",
      liquidity: "High",
      risk: "Medium-High",
      taxBenefits: "ELSS (80C)",
      minInvestment: "₹500",
      inflationProtection: "Excellent"
    },
    {
      option: "Fixed Deposits",
      returns: "6-7%",
      liquidity: "Medium",
      risk: "Low",
      taxBenefits: "None",
      minInvestment: "₹1,000",
      inflationProtection: "Poor"
    },
    {
      option: "Real Estate",
      returns: "8-10%",
      liquidity: "Low",
      risk: "High",
      taxBenefits: "Various",
      minInvestment: "₹25 Lakhs",
      inflationProtection: "Good"
    },
    {
      option: "Gold",
      returns: "8-9%",
      liquidity: "High",
      risk: "Medium",
      taxBenefits: "Limited",
      minInvestment: "₹1,000",
      inflationProtection: "Good"
    },
    {
      option: "PPF",
      returns: "7-8%",
      liquidity: "Low",
      risk: "Low",
      taxBenefits: "EEE (80C)",
      minInvestment: "₹500",
      inflationProtection: "Fair"
    }
  ];

  return (
    <div className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Investment Calculators & Comparisons</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Plan your investments with our comprehensive calculators and compare different investment options
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12">
            <TabsTrigger value="calculators" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Calculators</span>
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Comparisons</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculators">
            <Tabs defaultValue="sip" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
                <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
                <TabsTrigger value="lumpsum">Lumpsum</TabsTrigger>
                <TabsTrigger value="goal">Goal Planning</TabsTrigger>
                <TabsTrigger value="tax">Tax Savings</TabsTrigger>
              </TabsList>

              {/* SIP Calculator */}
              <TabsContent value="sip">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span>SIP Calculator</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Monthly Investment Amount</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <Slider
                            value={[sipAmount]}
                            onValueChange={(value) => setSipAmount(value[0])}
                            min={500}
                            max={100000}
                            step={500}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={sipAmount}
                            onChange={(e) => setSipAmount(Number(e.target.value))}
                            className="w-32"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">₹500 - ₹1,00,000</p>
                      </div>
                      
                      <div>
                        <Label>Investment Duration (Years)</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <Slider
                            value={[sipYears]}
                            onValueChange={(value) => setSipYears(value[0])}
                            min={1}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={sipYears}
                            onChange={(e) => setSipYears(Number(e.target.value))}
                            className="w-24"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Expected Annual Return (%)</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <Slider
                            value={[sipRate]}
                            onValueChange={(value) => setSipRate(value[0])}
                            min={8}
                            max={15}
                            step={0.5}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={sipRate}
                            onChange={(e) => setSipRate(Number(e.target.value))}
                            className="w-24"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Annual Step-up (%) - Optional</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <Slider
                            value={[sipStepUp]}
                            onValueChange={(value) => setSipStepUp(value[0])}
                            min={0}
                            max={20}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={sipStepUp}
                            onChange={(e) => setSipStepUp(Number(e.target.value))}
                            className="w-24"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const result = calculateSIP();
                        const chartData = generateSIPChartData();
                        const pieData = [
                          { name: 'Invested', value: result.totalInvested },
                          { name: 'Returns', value: result.gains }
                        ];
                        
                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="bg-primary/5 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Invested</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(result.totalInvested)}</p>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Expected Returns</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(result.gains)}</p>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Maturity Value</p>
                                <p className="text-lg font-bold text-blue-600">{formatCurrency(result.futureValue)}</p>
                              </div>
                            </div>
                            
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="year" />
                                  <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`} />
                                  <Tooltip formatter={(value) => formatCurrency(value)} />
                                  <Line type="monotone" dataKey="invested" stroke="#3B82F6" strokeWidth={2} />
                                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    dataKey="value"
                                  >
                                    {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Similar structure for other calculators... */}
              {/* I'll include the other calculators for completeness */}
              
              {/* Lumpsum Calculator */}
              <TabsContent value="lumpsum">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Lumpsum Calculator</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Investment Amount</Label>
                        <Input
                          type="number"
                          value={lumpAmount}
                          onChange={(e) => setLumpAmount(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Investment Duration (Years)</Label>
                        <Slider
                          value={[lumpYears]}
                          onValueChange={(value) => setLumpYears(value[0])}
                          min={1}
                          max={30}
                          step={1}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{lumpYears} years</p>
                      </div>
                      
                      <div>
                        <Label>Expected Annual Return (%)</Label>
                        <Slider
                          value={[lumpRate]}
                          onValueChange={(value) => setLumpRate(value[0])}
                          min={8}
                          max={15}
                          step={0.5}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{lumpRate}%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const result = calculateLumpsum();
                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="bg-primary/5 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Invested Amount</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(result.totalInvested)}</p>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Maturity Value</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(result.futureValue)}</p>
                              </div>
                            </div>
                            <div className="text-center p-6 bg-blue-50 rounded-lg">
                              <p className="text-sm text-muted-foreground">Total Returns</p>
                              <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.gains)}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Goal Planning Calculator */}
              <TabsContent value="goal">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span>Goal Planning Calculator</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Financial Goal</Label>
                        <Select value={goalType} onValueChange={setGoalType}>
                          <SelectTrigger className="mt-2">
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
                        <Label>Target Amount Needed</Label>
                        <Input
                          type="number"
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Time to Achieve Goal (Years)</Label>
                        <Slider
                          value={[goalYears]}
                          onValueChange={(value) => setGoalYears(value[0])}
                          min={1}
                          max={30}
                          step={1}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{goalYears} years</p>
                      </div>
                      
                      <div>
                        <Label>Current Savings for this Goal</Label>
                        <Input
                          type="number"
                          value={currentSavings}
                          onChange={(e) => setCurrentSavings(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Expected Inflation Rate (%)</Label>
                        <Slider
                          value={[inflationRate]}
                          onValueChange={(value) => setInflationRate(value[0])}
                          min={3}
                          max={8}
                          step={0.5}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{inflationRate}%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const result = calculateGoal();
                        return (
                          <div className="space-y-6">
                            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">Inflation Adjusted Goal</p>
                              <p className="text-xl font-bold text-yellow-600">{formatCurrency(result.inflationAdjustedGoal)}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-primary/5 p-4 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Required Monthly SIP</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(result.requiredSIP)}</p>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Required Lumpsum</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(result.requiredLumpsum)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tax Savings Calculator */}
              <TabsContent value="tax">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        <span>Tax Savings Calculator (ELSS)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Annual Income</Label>
                        <Input
                          type="number"
                          value={annualIncome}
                          onChange={(e) => setAnnualIncome(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Tax Bracket (%)</Label>
                        <Select value={taxBracket.toString()} onValueChange={(value) => setTaxBracket(Number(value))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                            <SelectItem value="30">30%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>ELSS Investment Amount (Max ₹1,50,000)</Label>
                        <Input
                          type="number"
                          value={taxInvestment}
                          onChange={(e) => setTaxInvestment(Number(e.target.value))}
                          max={150000}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Investment Duration (Years)</Label>
                        <Slider
                          value={[taxYears]}
                          onValueChange={(value) => setTaxYears(value[0])}
                          min={3}
                          max={15}
                          step={1}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{taxYears} years (Min 3 years lock-in)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const result = calculateTaxSavings();
                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-green-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Tax Savings</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(result.taxSavings)}</p>
                              </div>
                              <div className="bg-primary/5 p-4 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Net Investment</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(result.netInvestment)}</p>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">Expected Maturity Value</p>
                              <p className="text-xl font-bold text-blue-600">{formatCurrency(result.futureValue)}</p>
                            </div>
                            
                            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">Effective Annual Return</p>
                              <p className="text-lg font-bold text-yellow-600">{result.effectiveReturn.toFixed(2)}%</p>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="comparisons">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Investment Options Comparison</h2>
                <p className="text-muted-foreground">Compare different investment options to make informed decisions</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Investment Option</th>
                      <th className="text-center p-4 font-semibold">Expected Returns</th>
                      <th className="text-center p-4 font-semibold">Liquidity</th>
                      <th className="text-center p-4 font-semibold">Risk Level</th>
                      <th className="text-center p-4 font-semibold">Tax Benefits</th>
                      <th className="text-center p-4 font-semibold">Min Investment</th>
                      <th className="text-center p-4 font-semibold">Inflation Protection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentComparison.map((option, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">{option.option}</td>
                        <td className="p-4 text-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {option.returns}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${
                            option.liquidity === 'High' ? 'bg-green-100 text-green-800' :
                            option.liquidity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {option.liquidity}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${
                            option.risk === 'Low' ? 'bg-green-100 text-green-800' :
                            option.risk === 'Medium' || option.risk === 'Medium-High' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {option.risk}
                          </span>
                        </td>
                        <td className="p-4 text-center text-sm">{option.taxBenefits}</td>
                        <td className="p-4 text-center text-sm">{option.minInvestment}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${
                            option.inflationProtection === 'Excellent' || option.inflationProtection === 'Good' ? 'bg-green-100 text-green-800' :
                            option.inflationProtection === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {option.inflationProtection}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Key Takeaways:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mutual funds offer the best balance of returns and liquidity for long-term wealth creation</li>
                  <li>• ELSS funds provide dual benefits of tax savings and equity returns</li>
                  <li>• Diversification across multiple asset classes reduces overall portfolio risk</li>
                  <li>• Consider your risk tolerance and investment horizon when choosing options</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};