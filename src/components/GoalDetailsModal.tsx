import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  TrendingUp, 
  Shield, 
  Target, 
  AlertCircle,
  BarChart3,
  Percent,
  Clock
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface GoalDetailsModalProps {
  goal: {
    id: string;
    title: string;
    description: string;
    timeframe: string;
    avgAmount: string;
  };
  onClose: () => void;
}

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({ goal, onClose }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  // Sample data based on goal type
  const getGoalData = () => {
    switch (goal.id) {
      case 'education':
        return {
          currentCost: 2500000,
          futureInflationRate: 8,
          averageROI: { conservative: 8, moderate: 12, aggressive: 15 },
          factualData: [
            "Average cost of undergraduate engineering: ₹15-25 lakhs",
            "MBA from top institutes: ₹25-50 lakhs", 
            "Medical education: ₹50-75 lakhs",
            "Education inflation rate: 8-10% annually"
          ],
          riskFactors: ["High education inflation", "Course fee volatility", "Currency fluctuations for abroad studies"]
        };
      case 'home':
        return {
          currentCost: 5000000,
          futureInflationRate: 6,
          averageROI: { conservative: 9, moderate: 12, aggressive: 14 },
          factualData: [
            "Average home price appreciation: 6-8% annually",
            "Typical down payment: 20-30% of property value",
            "Loan tenure: 15-30 years",
            "Property registration costs: 7-10% of property value"
          ],
          riskFactors: ["Real estate market volatility", "Interest rate changes", "Location-specific risks"]
        };
      case 'car':
        return {
          currentCost: 1500000,
          futureInflationRate: 5,
          averageROI: { conservative: 8, moderate: 10, aggressive: 12 },
          factualData: [
            "Car depreciation: 15-20% in first year",
            "Average car price inflation: 5-7% annually",
            "Typical loan tenure: 3-7 years",
            "Insurance and maintenance: 10-15% of car value annually"
          ],
          riskFactors: ["Technology changes", "Model discontinuation", "Fuel price volatility"]
        };
      case 'travel':
        return {
          currentCost: 500000,
          futureInflationRate: 6,
          averageROI: { conservative: 7, moderate: 10, aggressive: 12 },
          factualData: [
            "International travel costs rising 6-8% annually",
            "Visa and documentation: ₹20,000-50,000",
            "Average Europe trip: ₹2-5 lakhs per person",
            "Currency fluctuations can impact costs by 10-15%"
          ],
          riskFactors: ["Currency exchange rate risks", "Travel restrictions", "Seasonal price variations"]
        };
      case 'marriage':
        return {
          currentCost: 2000000,
          futureInflationRate: 7,
          averageROI: { conservative: 8, moderate: 11, aggressive: 13 },
          factualData: [
            "Average Indian wedding cost: ₹20-50 lakhs",
            "Venue costs: 30-40% of total budget",
            "Catering: 25-35% of total budget",
            "Wedding inflation rate: 7-9% annually"
          ],
          riskFactors: ["Seasonal venue pricing", "Guest count variations", "Luxury inflation"]
        };
      default:
        return {
          currentCost: 1000000,
          futureInflationRate: 6,
          averageROI: { conservative: 8, moderate: 12, aggressive: 15 },
          factualData: ["General financial planning data"],
          riskFactors: ["Market volatility", "Inflation risk"]
        };
    }
  };

  const goalData = getGoalData();
  const years = parseInt(goal.timeframe.split('-')[0]);

  // Calculate different investment strategies
  const calculateStrategy = (strategy: 'conservative' | 'moderate' | 'aggressive') => {
    const returnRate = goalData.averageROI[strategy];
    const futureValue = goalData.currentCost * Math.pow(1 + goalData.futureInflationRate / 100, years);
    const monthlyRate = returnRate / 100 / 12;
    const months = years * 12;
    const requiredSIP = futureValue * (monthlyRate / (Math.pow(1 + monthlyRate, months) - 1));
    
    return {
      requiredSIP: Math.round(requiredSIP),
      futureValue: Math.round(futureValue),
      totalInvestment: Math.round(requiredSIP * months),
      returnRate,
      riskLevel: strategy === 'conservative' ? 'Low' : strategy === 'moderate' ? 'Medium' : 'High'
    };
  };

  const strategies = {
    conservative: calculateStrategy('conservative'),
    moderate: calculateStrategy('moderate'),
    aggressive: calculateStrategy('aggressive')
  };

  // Chart data for growth projection
  const chartData = Array.from({ length: years + 1 }, (_, i) => {
    const year = i;
    const invested = strategies[selectedStrategy].requiredSIP * 12 * year;
    const compoundGrowth = invested > 0 ? invested * Math.pow(1 + strategies[selectedStrategy].returnRate / 100, year) : 0;
    
    return {
      year,
      invested: Math.round(invested),
      projected: Math.round(compoundGrowth)
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pieData = [
    { name: 'Total Invested', value: strategies[selectedStrategy].totalInvestment },
    { name: 'Returns', value: strategies[selectedStrategy].futureValue - strategies[selectedStrategy].totalInvestment }
  ];

  const PIE_COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slide-up bg-white">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {goal.title} Planning Guide
            </CardTitle>
            <p className="text-gray-600 mt-1">{goal.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview & Facts</TabsTrigger>
              <TabsTrigger value="strategies">Investment Strategies</TabsTrigger>
              <TabsTrigger value="planning">Detailed Planning</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Key Facts & Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {goalData.factualData.map((fact, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                      Risk Factors to Consider
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {goalData.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Goal Timeline & Cost Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Current Cost</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(goalData.currentCost)}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Future Cost</div>
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(strategies.moderate.futureValue)}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Time Horizon</div>
                      <div className="text-lg font-bold text-gray-900">{goal.timeframe}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Inflation Rate</div>
                      <div className="text-lg font-bold text-red-600">{goalData.futureInflationRate}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Choose Your Investment Strategy</h3>
                <p className="text-gray-600">Each strategy has different risk-return profiles to match your comfort level</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {(['conservative', 'moderate', 'aggressive'] as const).map((strategy) => (
                  <Card 
                    key={strategy}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedStrategy === strategy ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{strategy}</span>
                        <Badge variant={strategy === 'conservative' ? 'secondary' : strategy === 'moderate' ? 'default' : 'destructive'}>
                          {strategies[strategy].riskLevel} Risk
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly SIP</span>
                          <span className="font-bold">{formatCurrency(strategies[strategy].requiredSIP)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Expected Return</span>
                          <span className="font-bold text-green-600">{strategies[strategy].returnRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Investment</span>
                          <span className="font-medium">{formatCurrency(strategies[strategy].totalInvestment)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="planning" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Growth Projection ({selectedStrategy})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Line type="monotone" dataKey="invested" stroke="#3b82f6" strokeWidth={2} name="Amount Invested" />
                          <Line type="monotone" dataKey="projected" stroke="#10b981" strokeWidth={2} name="Projected Value" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            dataKey="value" 
                            paddingAngle={5}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm">Total Invested</span>
                        </div>
                        <span className="font-medium">{formatCurrency(strategies[selectedStrategy].totalInvestment)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm">Expected Returns</span>
                        </div>
                        <span className="font-medium text-green-600">
                          {formatCurrency(strategies[selectedStrategy].futureValue - strategies[selectedStrategy].totalInvestment)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Action Plan for {goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Start Planning</h4>
                      <p className="text-sm text-gray-600">Begin with our {selectedStrategy} strategy and monthly SIP of {formatCurrency(strategies[selectedStrategy].requiredSIP)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Stay Protected</h4>
                      <p className="text-sm text-gray-600">Consider term insurance and emergency fund to protect your goals</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Regular Review</h4>
                      <p className="text-sm text-gray-600">Review and rebalance your portfolio annually or as goals change</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
              Start This Goal
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GoalDetailsModal;