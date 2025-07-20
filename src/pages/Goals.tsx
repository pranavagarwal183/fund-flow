import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  Target, 
  Plane, 
  Heart, 
  GraduationCap, 
  Car, 
  Home,
  Calculator,
  TrendingUp,
  Calendar,
  DollarSign,
  PiggyBank
} from "lucide-react";

interface GoalCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  timeframe: string;
  avgAmount: string;
  color: string;
  gradient: string;
}

const Goals = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [goalAmount, setGoalAmount] = useState("");
  const [timeYears, setTimeYears] = useState("");
  const [expectedReturns, setExpectedReturns] = useState("12");
  const [calculatedSIP, setCalculatedSIP] = useState<number | null>(null);

  const goalCategories: GoalCategory[] = [
    {
      id: "financial-freedom",
      title: "Financial Freedom",
      icon: Target,
      description: "Build wealth for early retirement and financial independence",
      timeframe: "15-25 years",
      avgAmount: "₹5-10 Crores",
      color: "text-blue-600",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      id: "travel",
      title: "Dream Vacation",
      icon: Plane,
      description: "Plan your perfect vacation or world tour",
      timeframe: "1-5 years",
      avgAmount: "₹2-10 Lakhs",
      color: "text-emerald-600",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: "marriage",
      title: "Wedding",
      icon: Heart,
      description: "Plan for your dream wedding celebration",
      timeframe: "2-5 years",
      avgAmount: "₹10-50 Lakhs",
      color: "text-pink-600",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      id: "education",
      title: "Child Education",
      icon: GraduationCap,
      description: "Secure your child's higher education future",
      timeframe: "10-18 years",
      avgAmount: "₹25-75 Lakhs",
      color: "text-purple-600",
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      id: "car",
      title: "Dream Car",
      icon: Car,
      description: "Buy your dream car without financial stress",
      timeframe: "2-7 years",
      avgAmount: "₹5-50 Lakhs",
      color: "text-orange-600",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      id: "home",
      title: "Dream Home",
      icon: Home,
      description: "Own your perfect home with proper planning",
      timeframe: "5-15 years",
      avgAmount: "₹50 Lakhs - 2 Crores",
      color: "text-cyan-600",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  const calculateSIP = () => {
    if (!goalAmount || !timeYears || !expectedReturns) return;

    const P = parseFloat(goalAmount);
    const n = parseInt(timeYears) * 12; // months
    const r = parseFloat(expectedReturns) / 100 / 12; // monthly rate

    // SIP formula: P = SIP * [((1+r)^n - 1) / r] * (1+r)
    // Rearranged: SIP = P / ([((1+r)^n - 1) / r] * (1+r))
    const denominator = (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const sip = P / denominator;

    setCalculatedSIP(Math.ceil(sip));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Turn Your Dreams Into Reality
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Set clear financial goals and let us help you achieve them with smart investment planning
          </p>
        </div>

        {/* Goal Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {goalCategories.map((goal) => {
            const IconComponent = goal.icon;
            return (
              <Card 
                key={goal.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-strong border-2 ${
                  selectedGoal === goal.id ? 'border-primary shadow-strong scale-105' : 'border-transparent hover:border-primary/20'
                }`}
                onClick={() => setSelectedGoal(goal.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${goal.gradient} p-2 mb-3`}>
                    <IconComponent className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-xl">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{goal.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeframe:</span>
                      <span className="font-medium">{goal.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typical Amount:</span>
                      <span className="font-medium">{goal.avgAmount}</span>
                    </div>
                  </div>
                  {selectedGoal === goal.id && (
                    <Button className="w-full mt-4 bg-gradient-primary">
                      <Target className="w-4 h-4 mr-2" />
                      Plan This Goal
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Goal SIP Calculator */}
        <Card className="shadow-strong border-l-4 border-l-primary mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary p-2">
                <Calculator className="w-full h-full text-white" />
              </div>
              <span>Free Goal Planning Calculator</span>
            </CardTitle>
            <p className="text-muted-foreground">
              Calculate the monthly SIP needed to achieve your financial goal
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Calculator Inputs */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="goal-amount" className="text-sm font-medium">
                    Goal Amount (₹)
                  </Label>
                  <Input
                    id="goal-amount"
                    type="number"
                    placeholder="e.g., 2500000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="time-years" className="text-sm font-medium">
                    Time Period (Years)
                  </Label>
                  <Input
                    id="time-years"
                    type="number"
                    placeholder="e.g., 10"
                    value={timeYears}
                    onChange={(e) => setTimeYears(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expected-returns" className="text-sm font-medium">
                    Expected Returns (% per annum)
                  </Label>
                  <Select value={expectedReturns} onValueChange={setExpectedReturns}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8% (Conservative)</SelectItem>
                      <SelectItem value="10">10% (Moderate)</SelectItem>
                      <SelectItem value="12">12% (Balanced)</SelectItem>
                      <SelectItem value="15">15% (Aggressive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateSIP}
                  className="w-full bg-gradient-primary"
                  disabled={!goalAmount || !timeYears}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Required SIP
                </Button>
              </div>

              {/* Results */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6">
                {calculatedSIP ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Monthly SIP Required
                      </h3>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {formatCurrency(calculatedSIP)}
                      </div>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between p-3 bg-background/50 rounded">
                        <span className="text-muted-foreground">Total Investment:</span>
                        <span className="font-medium">
                          {formatCurrency(calculatedSIP * parseInt(timeYears || "0") * 12)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-background/50 rounded">
                        <span className="text-muted-foreground">Expected Maturity:</span>
                        <span className="font-medium">{formatCurrency(parseInt(goalAmount || "0"))}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-background/50 rounded">
                        <span className="text-muted-foreground">Wealth Growth:</span>
                        <span className="font-medium text-success">
                          {formatCurrency(parseInt(goalAmount || "0") - (calculatedSIP * parseInt(timeYears || "0") * 12))}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-primary">
                      <PiggyBank className="w-4 h-4 mr-2" />
                      Start SIP Now
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Plan Your Investment
                    </h3>
                    <p className="text-muted-foreground">
                      Enter your goal details to see the required monthly SIP amount
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Goal-Based Investing */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Why Goal-Based Investing?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 mx-auto mb-3">
                  <Target className="w-full h-full text-white" />
                </div>
                <h3 className="font-semibold mb-2">Clear Purpose</h3>
                <p className="text-sm text-muted-foreground">
                  Having specific goals keeps you motivated and focused on your financial journey
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 p-2 mx-auto mb-3">
                  <Calendar className="w-full h-full text-white" />
                </div>
                <h3 className="font-semibold mb-2">Time-Based Strategy</h3>
                <p className="text-sm text-muted-foreground">
                  Different goals need different investment strategies based on time horizon
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 p-2 mx-auto mb-3">
                  <DollarSign className="w-full h-full text-white" />
                </div>
                <h3 className="font-semibold mb-2">Disciplined Saving</h3>
                <p className="text-sm text-muted-foreground">
                  Regular SIPs ensure you stay on track to achieve your financial goals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Goals;