import { useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import GoalDetailsModal from "@/components/GoalDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Target, Plane, Heart, GraduationCap, Car, Home, Calculator, TrendingUp,
  DollarSign, PiggyBank, Receipt,
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// Define the interface for a goal category
interface GoalCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  timeframe: string;
  avgAmount: string;
  gradient: string;
}

const GoalPlanner = () => {
  // Ref to smoothly scroll to the calculator section
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Consolidated State Management
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("goal");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoalForModal, setSelectedGoalForModal] = useState<GoalCategory | null>(null);

  // State for SIP Calculator
  const [sipAmount, setSipAmount] = useState(10000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12);
  const [sipStepUp, setSipStepUp] = useState(5);

  // State for Lumpsum Calculator
  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpYears, setLumpYears] = useState(10);
  const [lumpRate, setLumpRate] = useState(12);

  // State for Goal Planning Calculator
  const [goalAmount, setGoalAmount] = useState(2500000);
  const [goalYears, setGoalYears] = useState(10);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [inflationRate, setInflationRate] = useState(6);
  const [goalReturnRate, setGoalReturnRate] = useState(12);

  // Pre-defined Goal Categories
  const goalCategories: GoalCategory[] = [
    {
      id: "travel",
      title: "Dream Vacation",
      icon: Plane,
      description: "Plan your perfect getaway or world tour.",
      timeframe: "1-5 years",
      avgAmount: "₹2-10 Lakhs",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: "car",
      title: "New Car",
      icon: Car,
      description: "Get behind the wheel of your dream car.",
      timeframe: "2-7 years",
      avgAmount: "₹5-50 Lakhs",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      id: "home",
      title: "Dream Home",
      icon: Home,
      description: "Own your perfect home with a solid plan.",
      timeframe: "5-15 years",
      avgAmount: "₹50 Lakhs-2 Crores",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      id: "marriage",
      title: "Wedding",
      icon: Heart,
      description: "Plan for your dream wedding celebration.",
      timeframe: "2-5 years",
      avgAmount: "₹10-50 Lakhs",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      id: "education",
      title: "Child's Education",
      icon: GraduationCap,
      description: "Secure your child's higher education future.",
      timeframe: "10-18 years",
      avgAmount: "₹25-75 Lakhs",
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      id: "financial-freedom",
      title: "Financial Freedom",
      icon: Target,
      description: "Build wealth for early retirement.",
      timeframe: "15-25 years",
      avgAmount: "₹2-10 Crores",
      gradient: "from-blue-500 to-blue-700"
    },
  ];

  // --- Utility Functions ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // --- Advanced Calculation Logic ---

  // SIP Calculation with Step-up
  const calculateSIP = () => {
    const monthlyRate = sipRate / 100 / 12;
    const months = sipYears * 12;
    let totalInvested = 0;
    let futureValue = 0;

    for (let month = 1; month <= months; month++) {
      const currentYear = Math.ceil(month / 12);
      const stepUpMultiplier = Math.pow(1 + sipStepUp / 100, currentYear - 1);
      const monthlyInvestment = sipAmount * stepUpMultiplier;
      totalInvested += monthlyInvestment;
      futureValue = (futureValue + monthlyInvestment) * (1 + monthlyRate);
    }

    const gains = futureValue - totalInvested;
    return { futureValue, totalInvested, gains };
  };

  // Lumpsum Calculation
  const calculateLumpsum = () => {
    const futureValue = lumpAmount * Math.pow(1 + lumpRate / 100, lumpYears);
    const gains = futureValue - lumpAmount;
    return { futureValue, totalInvested: lumpAmount, gains };
  };

  // Goal Planning Calculation
  const calculateGoal = () => {
    // FV = P * (1 + i)^t
    const futureCostOfGoal = goalAmount * Math.pow(1 + inflationRate / 100, goalYears);
    // FV of existing savings
    const futureValueOfSavings = currentSavings * Math.pow(1 + goalReturnRate / 100, goalYears);
    const shortfall = futureCostOfGoal - futureValueOfSavings;

    if (shortfall <= 0) {
      return { requiredSIP: 0, futureCostOfGoal, shortfall: 0 };
    }
    
    // SIP = P * [i / ((1 + i)^t - 1)]
    const monthlyRate = goalReturnRate / 100 / 12;
    const months = goalYears * 12;
    const requiredSIP = shortfall * (monthlyRate / (Math.pow(1 + monthlyRate, months) - 1));

    return { requiredSIP: Math.max(0, requiredSIP), futureCostOfGoal, shortfall };
  };

  // --- Data for Charts ---
  const sipResult = calculateSIP();
  const sipPieData = [
    { name: 'Invested Amount', value: sipResult.totalInvested },
    { name: 'Wealth Gained', value: sipResult.gains },
  ];
  const PIE_COLORS = ['#3b82f6', '#10b981']; // Blue for invested, Green for gains

  const goalResult = calculateGoal();

  // --- Event Handlers ---
  const handleGoalSelect = (goal: GoalCategory) => {
    setSelectedGoalId(goal.id);

    // Helper to parse strings like "₹5-50 Lakhs"
    const parseValue = (valueStr: string) => {
      const sanitized = valueStr.replace(/₹|,/g, '').toLowerCase();
      const valuePart = sanitized.split('-')[0];
      const number = parseFloat(valuePart);
      if (sanitized.includes('crore')) return number * 1_00_00_000;
      if (sanitized.includes('lakh')) return number * 1_00_000;
      return number;
    };
    
    const parsedAmount = parseValue(goal.avgAmount);
    const parsedYears = parseInt(goal.timeframe.split('-')[0], 10);

    // Update the Goal Planner state
    setGoalAmount(parsedAmount);
    setGoalYears(parsedYears);
    setCurrentSavings(Math.round(parsedAmount * 0.1)); // Assume 10% already saved

    // Switch to the Goal tab and scroll
    setActiveTab("goal");
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLearnMore = (goal: GoalCategory) => {
    setSelectedGoalForModal(goal);
    setShowGoalModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* --- 1. Hero Section --- */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Turn Your Dreams Into Reality
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Select a goal to get started, or use our advanced calculators to chart your own path to financial success.
          </p>
        </section>

        {/* --- 2. Goal Selection Grid --- */}
        <section className="mb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalCategories.map((goal) => (
                <Card 
                key={goal.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 ${
                    selectedGoalId === goal.id 
                    ? 'border-primary shadow-xl scale-105' 
                    : 'border-transparent'
                }`}
                onClick={() => handleGoalSelect(goal)}
                >
                <CardHeader className="flex-row items-center gap-4">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${goal.gradient} p-2.5 flex-shrink-0`}>
                    <goal.icon className="w-full h-full text-white" />
                    </div>
                    <div>
                    <CardTitle className="text-xl text-foreground">{goal.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm mt-2 pt-3 border-t border-border">
                    <span className="text-muted-foreground">Typical Timeframe:</span>
                    <span className="font-semibold text-foreground">{goal.timeframe}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Typical Amount:</span>
                    <span className="font-semibold text-foreground">{goal.avgAmount}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLearnMore(goal);
                        }}
                      >
                        Learn More
                      </Button>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        </section>

        {/* --- 3. Advanced Calculator Suite --- */}
        <section ref={calculatorRef} className="scroll-mt-20">
            <Card className="shadow-2xl border-t-4 border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-foreground">Financial Planning Suite</CardTitle>
                  <p className="text-muted-foreground">Powerful tools to model your financial future.</p>
                </CardHeader>
                <CardContent>
                   <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-8">
                        <TabsTrigger value="goal"><Target className="w-4 h-4 mr-2"/>Goal Planner</TabsTrigger>
                        <TabsTrigger value="sip"><TrendingUp className="w-4 h-4 mr-2"/>SIP</TabsTrigger>
                        <TabsTrigger value="lumpsum"><DollarSign className="w-4 h-4 mr-2"/>Lumpsum</TabsTrigger>
                      </TabsList>

                      {/* Goal Planner Tab */}
                      <TabsContent value="goal">
                        <div className="grid lg:grid-cols-5 gap-8 items-start">
                           <div className="lg:col-span-3 space-y-6 p-6 bg-card rounded-lg border border-border">
                              <h3 className="text-xl font-semibold text-foreground">Plan for Your Goal</h3>
                              <div>
                                <Label htmlFor="goal-amount">How much do you need for your goal?</Label>
                                <Input id="goal-amount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} className="mt-1" placeholder="e.g., 2500000" />
                              </div>
                              <div>
                                <Label htmlFor="goal-years">How many years do you have?</Label>
                                <Input id="goal-years" type="number" value={goalYears} onChange={(e) => setGoalYears(Number(e.target.value))} className="mt-1" placeholder="e.g., 10" />
                              </div>
                              <div>
                                <Label htmlFor="current-savings">How much have you already saved for this?</Label>
                                <Input id="current-savings" type="number" value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} className="mt-1" placeholder="e.g., 500000" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Expected Returns (% p.a.)</Label>
                                    <Input type="number" value={goalReturnRate} onChange={(e) => setGoalReturnRate(Number(e.target.value))} className="mt-1" />
                                </div>
                                <div>
                                    <Label>Inflation Rate (% p.a.)</Label>
                                    <Input type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="mt-1" />
                                </div>
                              </div>
                           </div>
                           <div className="lg:col-span-2 bg-primary/5 dark:bg-primary/10 p-6 rounded-lg text-center h-full flex flex-col justify-center border border-primary/20">
                                <p className="text-lg text-muted-foreground mb-2">To reach your goal, you need to invest:</p>
                                <p className="text-4xl font-bold text-primary mb-4">{formatCurrency(goalResult.requiredSIP)}</p>
                                <p className="text-muted-foreground mb-6">per month</p>
                                <div className="text-sm space-y-2 text-left bg-card p-4 rounded-md border border-border">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Today's Goal Cost:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(goalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Future Goal Cost (with inflation):</span>
                                        <span className="font-medium text-foreground">{formatCurrency(goalResult.futureCostOfGoal)}</span>
                                    </div>
                                </div>
                                <Button size="lg" className="w-full mt-6 bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg">
                                  <PiggyBank className="w-5 h-5 mr-2"/> Start Goal SIP
                                </Button>
                           </div>
                        </div>
                      </TabsContent>

                      {/* SIP Calculator Tab */}
                      <TabsContent value="sip">
                         <div className="grid lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
                              <h3 className="text-xl font-semibold text-foreground">SIP Calculator</h3>
                              <div>
                                <Label>Monthly Investment: {formatCurrency(sipAmount)}</Label>
                                <Slider value={[sipAmount]} onValueChange={(v) => setSipAmount(v[0])} max={100000} min={500} step={500} className="mt-2"/>
                              </div>
                              <div>
                                <Label>Investment Duration: {sipYears} years</Label>
                                <Slider value={[sipYears]} onValueChange={(v) => setSipYears(v[0])} max={30} min={1} step={1} className="mt-2" />
                              </div>
                              <div>
                                <Label>Expected Returns (% p.a.): {sipRate}%</Label>
                                <Slider value={[sipRate]} onValueChange={(v) => setSipRate(v[0])} max={20} min={5} step={0.5} className="mt-2" />
                              </div>
                               <div>
                                <Label>Annual Step-up (%): {sipStepUp}%</Label>
                                <Slider value={[sipStepUp]} onValueChange={(v) => setSipStepUp(v[0])} max={20} min={0} step={1} className="mt-2" />
                              </div>
                            </div>
                            <div className="space-y-4 p-6 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                                <h3 className="text-xl font-semibold text-center text-foreground">Investment Projection</h3>
                                <div className="h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie data={sipPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                                        {sipPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />))}
                                      </Pie>
                                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="text-center">
                                    <p className="text-muted-foreground">In {sipYears} years, your total value could be</p>
                                    <p className="text-3xl font-bold text-primary">{formatCurrency(sipResult.futureValue)}</p>
                                </div>
                                <div className="text-sm space-y-2 pt-4 border-t border-border">
                                    <div className="flex justify-between items-center">
                                      <span className="flex items-center text-muted-foreground"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>Total Invested:</span>
                                      <span className="font-medium text-foreground">{formatCurrency(sipResult.totalInvested)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="flex items-center text-muted-foreground"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>Wealth Gained:</span>
                                      <span className="font-medium text-success">{formatCurrency(sipResult.gains)}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                      </TabsContent>

                      {/* Lumpsum Calculator Tab */}
                      <TabsContent value="lumpsum">
                        <div className="grid lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
                                <h3 className="text-xl font-semibold text-foreground">Lumpsum Calculator</h3>
                                <div>
                                    <Label>One-time Investment: {formatCurrency(lumpAmount)}</Label>
                                    <Slider value={[lumpAmount]} onValueChange={(v) => setLumpAmount(v[0])} max={10000000} min={10000} step={10000} className="mt-2" />
                                </div>
                                <div>
                                    <Label>Investment Duration: {lumpYears} years</Label>
                                    <Slider value={[lumpYears]} onValueChange={(v) => setLumpYears(v[0])} max={30} min={1} step={1} className="mt-2" />
                                </div>
                                <div>
                                    <Label>Expected Returns (% p.a.): {lumpRate}%</Label>
                                    <Slider value={[lumpRate]} onValueChange={(v) => setLumpRate(v[0])} max={20} min={5} step={0.5} className="mt-2" />
                                </div>
                            </div>
                            <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-lg text-center flex flex-col justify-center h-full border border-primary/20">
                                <p className="text-lg text-muted-foreground">Your investment could grow to:</p>
                                <p className="text-4xl font-bold text-primary my-4">{formatCurrency(calculateLumpsum().futureValue)}</p>
                                <div className="text-sm space-y-2 text-left bg-card p-4 rounded-md border border-border">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount Invested:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(calculateLumpsum().totalInvested)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Wealth Gained:</span>
                                        <span className="font-medium text-success">{formatCurrency(calculateLumpsum().gains)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </TabsContent>
                   </Tabs>
                </CardContent>
            </Card>
        </section>

         {/* --- 4. Disclaimer --- */}
        <section className="mt-16 text-center">
            <div className="p-6 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Important Disclaimer</h4>
                <p className="text-xs text-muted-foreground max-w-4xl mx-auto">
                    All calculations are illustrative and based on the inputs provided. They do not guarantee future returns. Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. It is advisable to consult with a financial advisor to make informed decisions based on your individual risk profile and financial goals.
                </p>
            </div>
        </section>

      </main>
      
      <Footer />

      {/* Goal Details Modal */}
      {showGoalModal && selectedGoalForModal && (
        <GoalDetailsModal
          goal={selectedGoalForModal}
          onClose={() => {
            setShowGoalModal(false);
            setSelectedGoalForModal(null);
          }}
        />
      )}
    </div>
  );
};

export default GoalPlanner;