import { useState } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Receipt,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Calculators = () => {
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12);
  
  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpYears, setLumpYears] = useState(5);
  const [lumpRate, setLumpRate] = useState(12);
  
  const [goalAmount, setGoalAmount] = useState(1000000);
  const [goalYears, setGoalYears] = useState(10);
  const [goalRate, setGoalRate] = useState(12);
  
  const [taxInvestment, setTaxInvestment] = useState(150000);
  const [taxBracket, setTaxBracket] = useState(30);
  const [taxYears, setTaxYears] = useState(3);
  const [taxRate, setTaxRate] = useState(12);

  // SIP Calculation
  const calculateSIP = () => {
    const monthlyRate = sipRate / 100 / 12;
    const months = sipYears * 12;
    const futureValue = sipAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalInvested = sipAmount * months;
    const gains = futureValue - totalInvested;
    
    return { futureValue, totalInvested, gains };
  };

  // Lumpsum Calculation
  const calculateLumpsum = () => {
    const futureValue = lumpAmount * Math.pow(1 + lumpRate / 100, lumpYears);
    const gains = futureValue - lumpAmount;
    
    return { futureValue, totalInvested: lumpAmount, gains };
  };

  // Goal Calculation
  const calculateGoal = () => {
    const monthlyRate = goalRate / 100 / 12;
    const months = goalYears * 12;
    const requiredSIP = goalAmount / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    
    return { requiredSIP };
  };

  // Tax Savings Calculation
  const calculateTaxSavings = () => {
    const taxSaved = Math.min(taxInvestment, 150000) * (taxBracket / 100); // Max 80C limit is 1.5L
    const futureValue = taxInvestment * Math.pow(1 + taxRate / 100, taxYears);
    const gains = futureValue - taxInvestment;
    const netBenefit = taxSaved + gains;
    
    return { taxSaved, futureValue, gains, netBenefit, lockInPeriod: taxYears };
  };

  const sipResult = calculateSIP();
  const lumpResult = calculateLumpsum();
  const goalResult = calculateGoal();
  const taxResult = calculateTaxSavings();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Investment Calculators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your investments with our comprehensive calculator suite. 
            Make informed decisions with accurate projections.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="sip" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="sip" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                SIP Calculator
              </TabsTrigger>
              <TabsTrigger value="lumpsum" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
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
                      <Label htmlFor="sip-amount">Monthly Investment Amount</Label>
                      <Input
                        id="sip-amount"
                        type="number"
                        value={sipAmount}
                        onChange={(e) => setSipAmount(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sip-years">Investment Period (Years)</Label>
                      <Input
                        id="sip-years"
                        type="number"
                        value={sipYears}
                        onChange={(e) => setSipYears(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sip-rate">Expected Annual Return (%)</Label>
                      <Input
                        id="sip-rate"
                        type="number"
                        step="0.1"
                        value={sipRate}
                        onChange={(e) => setSipRate(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

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
                      <span className="font-bold text-secondary-foreground">{formatCurrency(sipResult.gains)}</span>
                    </div>
                    <Button className="w-full mt-4 bg-white text-primary hover:bg-white/90">
                      Start SIP Investment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="lumpsum">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Lumpsum Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="lump-amount">Investment Amount</Label>
                      <Input
                        id="lump-amount"
                        type="number"
                        value={lumpAmount}
                        onChange={(e) => setLumpAmount(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lump-years">Investment Period (Years)</Label>
                      <Input
                        id="lump-years"
                        type="number"
                        value={lumpYears}
                        onChange={(e) => setLumpYears(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lump-rate">Expected Annual Return (%)</Label>
                      <Input
                        id="lump-rate"
                        type="number"
                        step="0.1"
                        value={lumpRate}
                        onChange={(e) => setLumpRate(Number(e.target.value))}
                        className="mt-1"
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
                    <Button className="w-full mt-4 bg-white text-secondary hover:bg-white/90">
                      Invest Lumpsum
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
                      <Label htmlFor="goal-amount">Target Amount</Label>
                      <Input
                        id="goal-amount"
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-years">Time Period (Years)</Label>
                      <Input
                        id="goal-years"
                        type="number"
                        value={goalYears}
                        onChange={(e) => setGoalYears(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-rate">Expected Annual Return (%)</Label>
                      <Input
                        id="goal-rate"
                        type="number"
                        step="0.1"
                        value={goalRate}
                        onChange={(e) => setGoalRate(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-warning to-warning-light text-warning-foreground">
                  <CardHeader>
                    <CardTitle>Required Investment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm opacity-90 mb-2">Monthly SIP Required</p>
                      <p className="font-bold text-3xl">{formatCurrency(goalResult.requiredSIP)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Target Amount</span>
                      <span className="font-medium">{formatCurrency(goalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Time Period</span>
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
                      <Label htmlFor="tax-investment">Investment Amount (Annual)</Label>
                      <Input
                        id="tax-investment"
                        type="number"
                        value={taxInvestment}
                        onChange={(e) => setTaxInvestment(Number(e.target.value))}
                        className="mt-1"
                        placeholder="Max ₹1,50,000 under 80C"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-bracket">Tax Bracket (%)</Label>
                      <Input
                        id="tax-bracket"
                        type="number"
                        value={taxBracket}
                        onChange={(e) => setTaxBracket(Number(e.target.value))}
                        className="mt-1"
                        placeholder="5, 20, 30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-years">Investment Period (Years)</Label>
                      <Input
                        id="tax-years"
                        type="number"
                        value={taxYears}
                        onChange={(e) => setTaxYears(Number(e.target.value))}
                        className="mt-1"
                        min="3"
                        placeholder="Minimum 3 years (ELSS lock-in)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-rate">Expected Annual Return (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="mt-1"
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
                      <span>Future Value</span>
                      <span className="font-medium">{formatCurrency(taxResult.futureValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Capital Gains</span>
                      <span className="font-medium">{formatCurrency(taxResult.gains)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-bold">Total Benefit</span>
                      <span className="font-bold text-xl">{formatCurrency(taxResult.netBenefit)}</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-md">
                      <p className="text-sm">
                        <strong>Lock-in Period:</strong> {taxResult.lockInPeriod} years (ELSS requirement)
                      </p>
                    </div>
                    <Button className="w-full mt-4 bg-white text-success hover:bg-white/90">
                      Invest in ELSS
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};