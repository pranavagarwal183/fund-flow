import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Check, AlertTriangle } from "lucide-react";

interface AdvisorPortfolioComparisonProps {
  onStartOnboarding: () => void;
}

type DataPoint = { year: number; value: number };

export default function AdvisorPortfolioComparison({ onStartOnboarding }: AdvisorPortfolioComparisonProps) {
  const goalValue = 2500000; // Example goal value for "Dream Home"

  const { selfManagedData, advisorData } = useMemo(() => {
    const years = Array.from({ length: 11 }, (_, i) => i); // 0..10 years
    // Self-managed: 10% nominal average return but volatile path with dips
    let self: DataPoint[] = [];
    let adv: DataPoint[] = [];
    let baseSelf = 200000; // starting corpus
    let baseAdv = 200000;
    for (const y of years) {
      // inject some volatility for self-managed
      const noise = y === 2 ? -0.15 : y === 5 ? -0.12 : y === 7 ? -0.08 : 0.0;
      baseSelf = Math.round(baseSelf * (1 + 0.10 + noise + (y === 0 ? 0 : 0.02)));
      baseAdv = Math.round(baseAdv * (1 + 0.125 + 0.01)); // smoother compounding
      self.push({ year: y, value: baseSelf });
      adv.push({ year: y, value: baseAdv });
    }
    return { selfManagedData: self, advisorData: adv };
  }, []);

  const currency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl">See the Difference an Advisor Makes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="self" className="w-full">
          <TabsList>
            <TabsTrigger value="self">Self-Managed Portfolio</TabsTrigger>
            <TabsTrigger value="advisor">Our Advisor-Managed Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="self" className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selfManagedData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tickFormatter={(y) => `${y}y`} />
                  <YAxis tickFormatter={(v) => `${Math.round(v/100000)}L`} />
                  <Tooltip formatter={(v: number) => currency(v)} labelFormatter={(l) => `${l} years`} />
                  <ReferenceLine y={goalValue} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Goal', position: 'right', fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric label="Projected Value" value={currency(selfManagedData[selfManagedData.length - 1].value)} />
              <Metric label="Annualized Return" value="~10%" />
              <Metric label="Volatility/Risk" value="High" />
              <div className="flex items-center text-amber-600 text-sm font-medium"><AlertTriangle className="h-4 w-4 mr-2" /> Goal Achievement: At Risk</div>
            </div>
          </TabsContent>

          <TabsContent value="advisor" className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={advisorData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tickFormatter={(y) => `${y}y`} />
                  <YAxis tickFormatter={(v) => `${Math.round(v/100000)}L`} />
                  <Tooltip formatter={(v: number) => currency(v)} labelFormatter={(l) => `${l} years`} />
                  <ReferenceLine y={goalValue} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Goal', position: 'right', fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric label="Projected Value" value={currency(advisorData[advisorData.length - 1].value)} />
              <Metric label="Annualized Return" value="~12.5%" />
              <Metric label="Volatility/Risk" value="Optimized" />
              <div className="flex items-center text-green-600 text-sm font-medium"><Check className="h-4 w-4 mr-2" /> Goal Achievement: Confident</div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button className="w-full micro-press" onClick={onStartOnboarding}>
            Unlock Your Advisor-Managed Portfolio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md border bg-muted/30">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}


