import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

type Answer = 'A' | 'B' | 'C';

const QUESTIONS = [
  {
    id: 'horizon',
    question: 'How long is your investment horizon?',
    options: { A: 'Less than 3 years', B: '3-7 years', C: '7+ years' },
  },
  {
    id: 'reaction',
    question: 'If your portfolio drops 15% in a month, you would…',
    options: { A: 'Sell to avoid more loss', B: 'Hold and wait', C: 'Invest more at lower prices' },
  },
  {
    id: 'income',
    question: 'What portion of your income can you invest monthly?',
    options: { A: 'Under 10%', B: '10-20%', C: '20%+' },
  },
  {
    id: 'goal',
    question: 'Your primary goal is…',
    options: { A: 'Capital protection', B: 'Balanced growth', C: 'Aggressive growth' },
  },
  {
    id: 'experience',
    question: 'Your investing experience level?',
    options: { A: 'Beginner', B: 'Intermediate', C: 'Advanced' },
  },
];

export default function RiskProfiler() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);
  const allAnswered = useMemo(() => QUESTIONS.every(q => answers[q.id]), [answers]);

  const profile = useMemo(() => {
    const score = Object.values(answers).reduce((acc, a) => acc + (a === 'A' ? 1 : a === 'B' ? 2 : 3), 0);
    if (score <= 7) return 'Conservative';
    if (score <= 11) return 'Balanced';
    return 'Growth';
  }, [answers]);

  const saveProfile = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      await supabase.from('user_profiles').update({ risk_profile: profile, updated_at: new Date().toISOString() }).eq('id', user.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Discover Your Investing Style</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {QUESTIONS.map(q => (
          <div key={q.id} className="space-y-2">
            <div className="font-medium text-foreground">{q.question}</div>
            <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v as Answer }))}>
              {Object.entries(q.options).map(([k, label]) => (
                <div className="flex items-center space-x-2" key={k}>
                  <RadioGroupItem value={k} id={`${q.id}-${k}`} />
                  <Label htmlFor={`${q.id}-${k}`}>{label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        {allAnswered && (
          <div className="p-3 rounded-md border bg-muted/30">
            <div className="text-sm text-muted-foreground">Your profile</div>
            <div className="text-base font-semibold">{profile}</div>
          </div>
        )}

        <Button disabled={!allAnswered || submitting} onClick={saveProfile} className="micro-press w-full">
          {submitting ? 'Saving…' : 'Save My Risk Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}


