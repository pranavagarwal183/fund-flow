import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, AlertCircle } from "lucide-react";
import { sanitizeInput, authRateLimit } from "@/lib/security";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      // Check rate limiting
      if (!authRateLimit.canAttempt(form.email)) {
        const remainingTime = authRateLimit.getRemainingTime(form.email);
        setError(`Too many login attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`);
        setLoading(false);
        return;
      }

      // Sanitize email input
      const sanitizedEmail = sanitizeInput(form.email).toLowerCase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: form.password,
      });
      
      if (authError) {
        // Handle specific error cases
        if (authError.message.includes('Invalid login credentials')) {
          setError("Invalid email or password. If you just signed up, please check your email and confirm your account first.");
        } else if (authError.message.includes('Email not confirmed')) {
          setError("Please check your email and click the confirmation link before logging in.");
        } else {
          setError(authError.message);
        }
      } else if (data.user) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Login to FundFlow</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
                <div className="text-center space-y-4">
                  <div className="text-success">✓ You are already logged in!</div>
                  <Button className="w-full" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center text-sm mt-2">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-primary underline">
                    Sign up
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}