import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, TrendingUp, Shield, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

const riskAssessmentSchema = z.object({
  age: z.string().min(1, "Please select your age group"),
  income: z.string().min(1, "Please select your income range"),
  experience: z.string().min(1, "Please select your investment experience"),
  horizon: z.string().min(1, "Please select your investment horizon"),
  risk_tolerance: z.string().min(1, "Please select your risk tolerance"),
  loss_reaction: z.string().min(1, "Please select how you'd react to losses"),
});

type RiskAssessmentData = z.infer<typeof riskAssessmentSchema>;

const questions = [
  {
    id: "age",
    title: "What is your age group?",
    options: [
      { value: "under_25", label: "Under 25", score: 5 },
      { value: "25_35", label: "25-35", score: 4 },
      { value: "36_45", label: "36-45", score: 3 },
      { value: "46_55", label: "46-55", score: 2 },
      { value: "over_55", label: "Over 55", score: 1 },
    ]
  },
  {
    id: "income",
    title: "What is your annual income range?",
    options: [
      { value: "under_5", label: "Under ₹5 Lakhs", score: 1 },
      { value: "5_10", label: "₹5-10 Lakhs", score: 2 },
      { value: "10_25", label: "₹10-25 Lakhs", score: 3 },
      { value: "25_50", label: "₹25-50 Lakhs", score: 4 },
      { value: "over_50", label: "Over ₹50 Lakhs", score: 5 },
    ]
  },
  {
    id: "experience",
    title: "How experienced are you with investments?",
    options: [
      { value: "beginner", label: "Beginner - No prior experience", score: 1 },
      { value: "basic", label: "Basic - Some FD/RD experience", score: 2 },
      { value: "moderate", label: "Moderate - Mutual funds experience", score: 3 },
      { value: "experienced", label: "Experienced - Stocks & MFs", score: 4 },
      { value: "expert", label: "Expert - All asset classes", score: 5 },
    ]
  },
  {
    id: "horizon",
    title: "What is your investment time horizon?",
    options: [
      { value: "short", label: "Less than 1 year", score: 1 },
      { value: "medium_short", label: "1-3 years", score: 2 },
      { value: "medium", label: "3-5 years", score: 3 },
      { value: "long", label: "5-10 years", score: 4 },
      { value: "very_long", label: "More than 10 years", score: 5 },
    ]
  },
  {
    id: "risk_tolerance",
    title: "Which investment approach suits you best?",
    options: [
      { value: "safety", label: "Safety first - Preserve capital", score: 1 },
      { value: "conservative", label: "Conservative - Steady growth", score: 2 },
      { value: "balanced", label: "Balanced - Moderate growth", score: 3 },
      { value: "growth", label: "Growth - Higher returns", score: 4 },
      { value: "aggressive", label: "Aggressive - Maximum returns", score: 5 },
    ]
  },
  {
    id: "loss_reaction",
    title: "How would you react to a 20% loss in your portfolio?",
    options: [
      { value: "panic", label: "Panic and sell immediately", score: 1 },
      { value: "worried", label: "Very worried, consider selling", score: 2 },
      { value: "concerned", label: "Concerned but hold", score: 3 },
      { value: "calm", label: "Stay calm, review strategy", score: 4 },
      { value: "opportunity", label: "See it as buying opportunity", score: 5 },
    ]
  }
];

const getRiskProfile = (score: number) => {
  if (score <= 10) return { category: "Conservative", color: "bg-blue-500", allocation: { equity: 20, debt: 75, gold: 5 } };
  if (score <= 15) return { category: "Moderate Conservative", color: "bg-green-500", allocation: { equity: 35, debt: 60, gold: 5 } };
  if (score <= 20) return { category: "Balanced", color: "bg-yellow-500", allocation: { equity: 50, debt: 45, gold: 5 } };
  if (score <= 25) return { category: "Moderate Aggressive", color: "bg-orange-500", allocation: { equity: 70, debt: 25, gold: 5 } };
  return { category: "Aggressive", color: "bg-red-500", allocation: { equity: 85, debt: 10, gold: 5 } };
};

interface RiskProfilerProps {
  onComplete?: (profile: any) => void;
}

export const RiskProfiler = ({ onComplete }: RiskProfilerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalProfile, setFinalProfile] = useState<any>(null);
  const { user } = useAuth();

  const form = useForm<RiskAssessmentData>({
    resolver: zodResolver(riskAssessmentSchema),
  });

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RiskAssessmentData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Calculate risk score
      const totalScore = questions.reduce((sum, question) => {
        const answer = data[question.id as keyof RiskAssessmentData];
        const option = question.options.find(opt => opt.value === answer);
        return sum + (option?.score || 0);
      }, 0);

      const riskProfile = getRiskProfile(totalScore);
      
      // Save to database
      const { error } = await supabase
        .from('risk_assessments')
        .upsert({
          user_id: user.id,
          responses: data,
          risk_score: totalScore,
          risk_category: riskProfile.category,
          recommended_equity_allocation: riskProfile.allocation.equity,
          recommended_debt_allocation: riskProfile.allocation.debt,
          recommended_gold_allocation: riskProfile.allocation.gold,
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Valid for 1 year
        });

      if (error) throw error;

      // Update user profile with risk category
      await supabase
        .from('user_profiles')
        .update({
          risk_profile: riskProfile.category,
          risk_category: riskProfile.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      setFinalProfile({ ...riskProfile, score: totalScore });
      setIsCompleted(true);
      toast.success("Risk profile assessment completed!");
      
      setTimeout(() => {
        onComplete?.({ ...riskProfile, score: totalScore });
      }, 2000);
    } catch (error) {
      console.error('Error saving risk assessment:', error);
      toast.error("Failed to save risk assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  if (isCompleted && finalProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-2xl text-foreground">Assessment Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <Badge className={`${finalProfile.color} text-white text-lg px-6 py-2`}>
                {finalProfile.category} Investor
              </Badge>
              <p className="text-muted-foreground">
                Based on your responses, we've identified your investment profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 text-primary mx-auto" />
                <h4 className="font-semibold">Equity</h4>
                <div className="text-2xl font-bold text-primary">{finalProfile.allocation.equity}%</div>
              </div>
              <div className="space-y-2">
                <Shield className="w-8 h-8 text-secondary mx-auto" />
                <h4 className="font-semibold">Debt</h4>
                <div className="text-2xl font-bold text-secondary">{finalProfile.allocation.debt}%</div>
              </div>
              <div className="space-y-2">
                <Target className="w-8 h-8 text-yellow-500 mx-auto" />
                <h4 className="font-semibold">Gold</h4>
                <div className="text-2xl font-bold text-yellow-500">{finalProfile.allocation.gold}%</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              This assessment is valid for one year and helps us recommend suitable investment options for you.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Target className="w-6 w-6 mr-3 text-primary" />
            Risk Profile Assessment
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name={currentQuestion.id as keyof RiskAssessmentData}
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-lg font-semibold text-foreground">
                          {currentQuestion.title}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-3"
                          >
                            {currentQuestion.options.map((option) => (
                              <motion.div
                                key={option.value}
                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <RadioGroupItem value={option.value} id={option.value} />
                                <Label 
                                  htmlFor={option.value} 
                                  className="flex-1 cursor-pointer text-sm"
                                >
                                  {option.label}
                                </Label>
                              </motion.div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="micro-press"
                >
                  Previous
                </Button>

                {currentStep === questions.length - 1 ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-primary micro-press"
                  >
                    {isSubmitting ? "Calculating..." : "Complete Assessment"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!form.watch(currentQuestion.id as keyof RiskAssessmentData)}
                    className="bg-gradient-primary micro-press"
                  >
                    Next
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};