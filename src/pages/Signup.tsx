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
import { CheckCircle, AlertCircle, Mail } from "lucide-react";
import { validatePassword, validatePhoneNumber, sanitizeInput, authRateLimit } from "@/lib/security";

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
  });
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
        setError(`Too many signup attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`);
        setLoading(false);
        return;
      }

      // Validate password strength
      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message || "Password does not meet security requirements.");
        setLoading(false);
        return;
      }

      // Validate phone number if provided
      if (form.phone && form.phone.trim()) {
        const phoneValidation = validatePhoneNumber(form.phone);
        if (!phoneValidation.isValid) {
          setError(phoneValidation.message || "Invalid phone number format.");
          setLoading(false);
          return;
        }
      }

      // Sanitize inputs
      const sanitizedForm = {
        ...form,
        email: sanitizeInput(form.email).toLowerCase(),
        full_name: sanitizeInput(form.full_name),
        phone: sanitizeInput(form.phone)
      };

      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: sanitizedForm.email,
        password: form.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedForm.full_name,
            phone: sanitizedForm.phone,
            date_of_birth: form.date_of_birth,
            gender: form.gender,
          }
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError("This email is already registered. Please try logging in instead.");
        } else {
          setError(signUpError.message);
        }
      } else if (data.user) {
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to manually create profile if trigger failed
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: sanitizedForm.full_name,
              phone: sanitizedForm.phone,
              date_of_birth: form.date_of_birth,
              gender: form.gender,
              kyc_status: 'pending',
              risk_profile_status: 'pending',
              account_status: 'active'
            });
          
          if (profileError) {
            console.warn('Profile creation warning:', profileError);
            // Continue anyway as the trigger might have succeeded
          }
        } catch (profileErr) {
          console.warn('Profile creation error:', profileErr);
          // Continue anyway
        }

        if (data.user.email_confirmed_at) {
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          setSuccess("Account created! Please check your email and click the confirmation link before logging in.");
          setTimeout(() => navigate("/login"), 3000);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
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
            <CardTitle className="text-center">Create your Investment account</CardTitle>
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
                
                <Alert className="border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    After signing up, you'll receive a confirmation email. Please check your inbox and click the confirmation link before logging in.
                  </AlertDescription>
                </Alert>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@email.com"
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
                    placeholder="At least 8 characters with uppercase, lowercase & number"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    disabled={loading}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Password must contain at least 8 characters with uppercase, lowercase letters and numbers.
                  </div>
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    disabled={loading}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
                <div className="text-center text-sm mt-2">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary underline">
                    Login
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