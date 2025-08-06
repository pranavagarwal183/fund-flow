import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserPlus,
  Fingerprint,
  TrendingUp,
  ArrowRight,
  Shield,
  FileText,
  Calculator,
  PiggyBank,
  Building2,
  Cpu,
  Target,
} from "lucide-react";

export default function Services() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-600 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Expert-Guided Mutual Fund Services
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              We provide expert-guided services that allow you to invest in mutual funds and plan for your financial goals. Our dedicated team actively monitors your portfolio and makes necessary adjustments to keep you on track.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                document.getElementById("setup-section")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Our Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Core Services Section */}
        <section id="setup-section" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                A Smarter Way to Invest
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our platform simplifies every step of the investment process, empowering you with data-driven insights and effortless control.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Column 1 */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Seamless Onboarding</h3>
                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg w-min mb-2">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Instant Account Opening</CardTitle>
                    <CardDescription>Start in minutes with our fully digital and paperless setup process.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg w-min mb-2">
                      <Fingerprint className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Effortless eKYC</CardTitle>
                    <CardDescription>Complete your KYC verification online with our secure and compliant system.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Expert-Guided Planning</h3>
                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg w-min mb-2">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Goal-Based Financial Planning</CardTitle>
                    <CardDescription>Our financial experts create customized investment strategies aligned with your specific life goals and timeline.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg w-min mb-2">
                      <Cpu className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Direct Mutual Fund Platform</CardTitle>
                    <CardDescription>Access thousands of mutual funds with zero commission. Invest directly and save on fees while building your wealth.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Column 3 */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Expert Portfolio Management</h3>
                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg w-min mb-2">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Portfolio Monitoring & Management</CardTitle>
                    <CardDescription>Our dedicated team actively monitors your portfolio and makes necessary adjustments to keep you on track.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg w-min mb-2">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Proactive Rebalancing</CardTitle>
                    <CardDescription>Regular portfolio reviews and rebalancing to ensure optimal asset allocation and risk management.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20 bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Your Complete Investment Toolkit
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We provide comprehensive tools to support every aspect of your financial journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center border-0 shadow-none bg-transparent">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg inline-block mb-4">
                  <PiggyBank className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Flexible Transactions</CardTitle>
                <CardDescription>Manage SIPs, lumpsum investments, and withdrawals with ease.</CardDescription>
              </Card>

              <Card className="text-center border-0 shadow-none bg-transparent">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg inline-block mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Document Hub</CardTitle>
                <CardDescription>Access all your statements and portfolio reports in one secure place.</CardDescription>
              </Card>

              <Card className="text-center border-0 shadow-none bg-transparent">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg inline-block mb-4">
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Smart Tax Planning</CardTitle>
                <CardDescription>Get automated capital gains calculations and tax-saving insights.</CardDescription>
              </Card>

              <Card className="text-center border-0 shadow-none bg-transparent">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg inline-block mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Bank-Grade Security</CardTitle>
                <CardDescription>Your data and investments are protected with the highest security standards.</CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Build Your Future?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of investors who trust FundFinder to guide their financial journey.
            </p>
            <Button size="lg" variant="secondary" onClick={() => window.location.href = '/signup'}>
              Sign Up for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
