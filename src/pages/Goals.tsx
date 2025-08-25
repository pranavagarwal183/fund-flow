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
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Target, Plane, Heart, GraduationCap, Car, Home,
  PiggyBank,
} from "lucide-react";

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
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoalForModal, setSelectedGoalForModal] = useState<GoalCategory | null>(null);

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

    // Scroll to the calculator
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
            Select a goal to get started, or use our advanced calculator to chart your own path to financial success.
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
                  <p className="text-muted-foreground">A powerful tool to model your financial future.</p>
                </CardHeader>
                <CardContent>
                    <div className="grid lg:grid-cols-5 gap-8 items-start">
                        <div className="lg:col-span-3 space-y-6 p-6 bg-card rounded-lg border border-border">
                            <h3 className="text-xl font-semibold text-foreground flex items-center"><Target className="w-5 h-5 mr-2 text-primary"/>Plan for Your Goal</h3>
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
