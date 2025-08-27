import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { BarChartHorizontal, Zap, Shield, Target, TrendingUp } from "lucide-react";

const QUESTIONS = [
  {
    id: 'horizon',
    question: 'What is your investment time horizon?',
    options: [
      { value: 'A', label: 'Less than 3 years', score: 1 },
      { value: 'B', label: '3-5 years', score: 2 },
      { value: 'C', label: '5-10 years', score: 3 },
      { value: 'D', label: '10-20 years', score: 4 },
      { value: 'E', label: 'More than 20 years', score: 5 }
    ]
  },
  {
    id: 'reaction',
    question: 'How would you react if your portfolio dropped 20% in a month?',
    options: [
      { value: 'A', label: 'Sell everything immediately', score: 1 },
      { value: 'B', label: 'Sell some investments', score: 2 },
      { value: 'C', label: 'Hold and wait', score: 3 },
      { value: 'D', label: 'Buy more at lower prices', score: 4 },
      { value: 'E', label: 'Significantly increase my investment', score: 5 }
    ]
  },
  {
    id: 'income',
    question: 'What percentage of your monthly income can you comfortably invest?',
    options: [
      { value: 'A', label: 'Less than 5%', score: 1 },
      { value: 'B', label: '5-10%', score: 2 },
      { value: 'C', label: '10-20%', score: 3 },
      { value: 'D', label: '20-30%', score: 4 },
      { value: 'E', label: 'More than 30%', score: 5 }
    ]
  },
  {
    id: 'goal',
    question: 'What is your primary investment goal?',
    options: [
      { value: 'A', label: 'Capital preservation', score: 1 },
      { value: 'B', label: 'Steady income', score: 2 },
      { value: 'C', label: 'Balanced growth', score: 3 },
      { value: 'D', label: 'Capital appreciation', score: 4 },
      { value: 'E', label: 'Maximum growth', score: 5 }
    ]
  },
  {
    id: 'experience',
    question: 'What is your experience level with investments?',
    options: [
      { value: 'A', label: 'No experience', score: 1 },
      { value: 'B', label: 'Beginner (1-2 years)', score: 2 },
      { value: 'C', label: 'Intermediate (3-5 years)', score: 3 },
      { value: 'D', label: 'Advanced (5-10 years)', score: 4 },
      { value: 'E', label: 'Expert (10+ years)', score: 5 }
    ]
  },
  {
    id: 'knowledge',
    question: 'How would you rate your knowledge of financial markets?',
    options: [
      { value: 'A', label: 'Very limited', score: 1 },
      { value: 'B', label: 'Basic understanding', score: 2 },
      { value: 'C', label: 'Moderate knowledge', score: 3 },
      { value: 'D', label: 'Good understanding', score: 4 },
      { value: 'E', label: 'Expert level', score: 5 }
    ]
  },
  {
    id: 'volatility',
    question: 'How comfortable are you with investment volatility?',
    options: [
      { value: 'A', label: 'Very uncomfortable', score: 1 },
      { value: 'B', label: 'Somewhat uncomfortable', score: 2 },
      { value: 'C', label: 'Neutral', score: 3 },
      { value: 'D', label: 'Somewhat comfortable', score: 4 },
      { value: 'E', label: 'Very comfortable', score: 5 }
    ]
  },
  {
    id: 'emergency',
    question: 'Do you have an emergency fund covering 6+ months of expenses?',
    options: [
      { value: 'A', label: 'No emergency fund', score: 1 },
      { value: 'B', label: 'Less than 3 months', score: 2 },
      { value: 'C', label: '3-6 months', score: 3 },
      { value: 'D', label: '6-12 months', score: 4 },
      { value: 'E', label: 'More than 12 months', score: 5 }
    ]
  },
  {
    id: 'debt',
    question: 'What is your current debt situation?',
    options: [
      { value: 'A', label: 'High debt burden', score: 1 },
      { value: 'B', label: 'Moderate debt', score: 2 },
      { value: 'C', label: 'Low debt', score: 3 },
      { value: 'D', label: 'Minimal debt', score: 4 },
      { value: 'E', label: 'No debt', score: 5 }
    ]
  },
  {
    id: 'diversification',
    question: 'How important is portfolio diversification to you?',
    options: [
      { value: 'A', label: 'Not important', score: 1 },
      { value: 'B', label: 'Somewhat important', score: 2 },
      { value: 'C', label: 'Important', score: 3 },
      { value: 'D', label: 'Very important', score: 4 },
      { value: 'E', label: 'Extremely important', score: 5 }
    ]
  }
];

const RISK_PROFILES = {
  conservative: {
    title: 'Conservative',
    description: 'You prefer capital preservation over growth. Your investments focus on stability and steady, modest returns.',
    icon: Shield,
    color: 'text-blue-500',
    allocation: {
      equity: 20,
      debt: 60,
      gold: 15,
      cash: 5
    }
  },
  moderatelyConservative: {
    title: 'Moderately Conservative',
    description: 'You seek a balance between safety and growth, preferring moderate risk for steady returns.',
    icon: BarChartHorizontal,
    color: 'text-cyan-500',
    allocation: {
      equity: 35,
      debt: 50,
      gold: 10,
      cash: 5
    }
  },
  balanced: {
    title: 'Balanced',
    description: 'You maintain an equal balance between growth and stability, suitable for medium-term goals.',
    icon: Target,
    color: 'text-green-500',
    allocation: {
      equity: 50,
      debt: 35,
      gold: 10,
      cash: 5
    }
  },
  growth: {
    title: 'Growth',
    description: 'You prioritize capital appreciation and are comfortable with higher volatility for better returns.',
    icon: TrendingUp,
    color: 'text-orange-500',
    allocation: {
      equity: 70,
      debt: 20,
      gold: 5,
      cash: 5
    }
  },
  aggressiveGrowth: {
    title: 'Aggressive Growth',
    description: 'You seek maximum returns and are comfortable with high volatility and risk.',
    icon: Zap,
    color: 'text-red-500',
    allocation: {
      equity: 85,
      debt: 10,
      gold: 3,
      cash: 2
    }
  }
};

export default function RiskProfiler() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const allAnswered = useMemo(() => QUESTIONS.every(q => answers[q.id]), [answers]);

  const calculateProfile = useMemo(() => {
    if (!allAnswered) return null;
    
    const totalScore = QUESTIONS.reduce((acc, q) => {
      const answer = answers[q.id];
      const option = q.options.find(opt => opt.value === answer);
      return acc + (option?.score || 0);
    }, 0);

    if (totalScore <= 20) return 'conservative';
    if (totalScore <= 30) return 'moderatelyConservative';
    if (totalScore <= 40) return 'balanced';
    if (totalScore <= 50) return 'growth';
    return 'aggressiveGrowth';
  }, [answers, allAnswered]);

  const saveProfile = async () => {
    if (!user || !calculateProfile) return;
    try {
      setSubmitting(true);
      await supabase.from('user_profiles').update({ 
        risk_profile: calculateProfile, 
        updated_at: new Date().toISOString() 
      }).eq('id', user.id);
      setShowResults(true);
    } catch (error) {
      console.error('Error saving risk profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetProfile = () => {
    setAnswers({});
    setShowResults(false);
  };

  if (showResults && calculateProfile) {
    const profile = RISK_PROFILES[calculateProfile as keyof typeof RISK_PROFILES];
    const IconComponent = profile.icon;
    
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${profile.color}`} />
            Your Risk Profile: {profile.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{profile.description}</p>
          
          <div className="space-y-4">
            <h4 className="font-medium">Recommended Asset Allocation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold text-blue-600">{profile.allocation.equity}%</div>
                <div className="text-sm text-muted-foreground">Equity</div>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold text-green-600">{profile.allocation.debt}%</div>
                <div className="text-sm text-muted-foreground">Debt</div>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold text-yellow-600">{profile.allocation.gold}%</div>
                <div className="text-sm text-muted-foreground">Gold</div>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold text-gray-600">{profile.allocation.cash}%</div>
                <div className="text-sm text-muted-foreground">Cash</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={resetProfile} variant="outline" className="flex-1">
              Retake Assessment
            </Button>
            <Button className="flex-1">
              View Recommended Funds
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Discover Your Investing Style</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {QUESTIONS.map(q => (
          <div key={q.id} className="space-y-3">
            <div className="font-medium text-foreground">{q.question}</div>
            <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}>
              {q.options.map(option => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem value={option.value} id={`${q.id}-${option.value}`} />
                  <Label htmlFor={`${q.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <Button disabled={!allAnswered || submitting} onClick={saveProfile} className="micro-press w-full">
          {submitting ? 'Saving…' : 'Complete Assessment'}
        </Button>
      </CardContent>
    </Card>
  );
}


