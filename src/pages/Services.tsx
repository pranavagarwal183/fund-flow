import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Smartphone, 
  CreditCard, 
  Fingerprint, 
  Building2, 
  TrendingUp,
  FileText,
  Calculator,
  PiggyBank,
  Shield,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Complete Investment Services
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Everything you need to start and manage your mutual fund investments
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Account Setup Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Your Investment Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete your account setup in minutes with our streamlined process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Basic Setup Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Basic Setup</h3>
              
              {/* Account Opening Card */}
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  </div>
                  <CardTitle>Open Investment Account</CardTitle>
                  <CardDescription>
                    Quick 5-minute account setup with digital verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Instant account opening
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Digital verification
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Zero account opening fees
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Email and mobile verification
                    </li>
                  </ul>
                  <Button className="w-full">Start Now</Button>
                </CardContent>
              </Card>

              {/* Mobile Verification Card */}
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <CardTitle>Mobile Number Linking</CardTitle>
                  <CardDescription>
                    Secure your account with OTP verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      OTP-based verification
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      SMS transaction alerts
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Secure login authentication
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Recovery option setup
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Verify Now</Button>
                </CardContent>
              </Card>
            </div>

            {/* KYC Compliance Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">KYC Compliance</h3>
              
              {/* PAN Card Verification */}
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <CardTitle>PAN Card Linking</CardTitle>
                  <CardDescription>
                    Link your PAN for tax compliance and verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Instant PAN verification
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Tax calculation automation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Compliance with IT regulations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Capital gains tracking
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Link PAN</Button>
                </CardContent>
              </Card>

              {/* Aadhaar Verification */}
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Fingerprint className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="destructive">
                      KYC Pending
                    </Badge>
                  </div>
                  <CardTitle>Aadhaar eKYC</CardTitle>
                  <CardDescription>
                    Complete KYC instantly with Aadhaar verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Instant KYC completion
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Biometric authentication
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Address verification
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      UIDAI compliance
                    </li>
                  </ul>
                  <Button className="w-full">Complete eKYC</Button>
                </CardContent>
              </Card>
            </div>

            {/* Banking & Investment Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Banking & Investment</h3>
              
              {/* Bank Account Linking */}
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <CardTitle>Bank Account Verification</CardTitle>
                  <CardDescription>
                    Link your bank account for seamless transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Multiple bank support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Penny drop verification
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Auto-debit setup for SIP
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Instant redemption
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Link Bank</Button>
                </CardContent>
              </Card>

              {/* Investment Setup */}
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <CardTitle>Investment Preferences</CardTitle>
                  <CardDescription>
                    Set up your investment goals and risk profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Risk assessment questionnaire
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Goal-based planning
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Investment recommendations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Portfolio allocation
                    </li>
                  </ul>
                  <Button className="w-full">Setup Profile</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Account Setup Progress</span>
              <span className="text-sm text-muted-foreground">3 of 6 completed</span>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive investment management tools and support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Transaction Services */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-6">Transaction Services</h3>
              
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <PiggyBank className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>SIP Management</CardTitle>
                      <CardDescription>Automated investment management</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Start/Stop/Modify SIP
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Auto-debit setup
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      SIP calendar management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Flexible payment dates
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Lumpsum Investments</CardTitle>
                      <CardDescription>One-time and systematic investments</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      One-time investments
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Systematic Transfer Plans (STP)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Systematic Withdrawal Plans (SWP)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Switch between funds
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Support Services */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-6">Support Services</h3>
              
              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Document Management</CardTitle>
                      <CardDescription>Digital document storage and access</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Digital document storage
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Transaction statements
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Tax documents (Form 16A)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Portfolio reports
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Tax Services</CardTitle>
                      <CardDescription>Automated tax calculations and reports</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Capital gains calculation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Tax-loss harvesting
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      ELSS recommendations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      TDS certificate generation
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust FundFlow for their mutual fund investments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Complete Setup
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;