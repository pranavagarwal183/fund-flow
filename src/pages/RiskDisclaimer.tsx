import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Info, FileText } from "lucide-react";

const RiskDisclaimer = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Risk Disclaimer</h1>
            <p className="text-xl text-muted-foreground">
              Important information about investment risks and disclaimers
            </p>
          </div>

          <div className="space-y-8">
            {/* Main Risk Warning */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Important Risk Warning</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-destructive/90 font-medium">
                  Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
                </p>
                <p className="text-muted-foreground">
                  Past performance is not indicative of future returns. The value of investments can go down as well as up, 
                  and you may get back less than you invested.
                </p>
              </CardContent>
            </Card>

            {/* Investment Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-primary" />
                  <span>Investment Risks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Market Risk</h3>
                  <p className="text-muted-foreground text-sm">
                    The value of investments may fluctuate due to changes in market conditions, economic factors, 
                    and investor sentiment.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Credit Risk</h3>
                  <p className="text-muted-foreground text-sm">
                    Risk of default by the issuer of debt securities in which the fund invests.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Liquidity Risk</h3>
                  <p className="text-muted-foreground text-sm">
                    Risk that the fund may not be able to sell securities quickly at fair prices.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Interest Rate Risk</h3>
                  <p className="text-muted-foreground text-sm">
                    Changes in interest rates may affect the value of debt securities.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Calculator Disclaimer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Calculator & Projection Disclaimer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The calculators and projections provided on this platform are for illustrative purposes only. 
                  They are based on assumed rates of return and do not guarantee actual returns.
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                  <li>Actual returns may vary significantly from projected returns</li>
                  <li>Calculations do not account for taxes, fees, and market volatility</li>
                  <li>Results should not be considered as investment advice</li>
                  <li>Consult a financial advisor for personalized investment planning</li>
                </ul>
              </CardContent>
            </Card>

            {/* SEBI Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>SEBI Compliance & Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  FundFlow is a SEBI registered Investment Adviser (Registration No: INH000001234). 
                  We are authorized to provide investment advisory services subject to SEBI regulations.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">SEBI Registration</h4>
                    <p className="text-muted-foreground">INH000001234</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">AMFI Registration</h4>
                    <p className="text-muted-foreground">ARN-12345</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liability Disclaimer */}
            <Card>
              <CardHeader>
                <CardTitle>Liability Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  FundFlow does not guarantee returns and does not accept liability for investment losses. 
                  All investment decisions should be taken in consultation with your financial advisor.
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                  <li>We do not provide any warranty regarding the accuracy of information</li>
                  <li>Investment decisions are solely at the investor's discretion</li>
                  <li>We are not liable for any direct or indirect losses</li>
                  <li>Past performance data is obtained from public sources and may contain errors</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Grievance Redressal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  For any complaints or grievances related to our services, please contact:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> grievance@fundflow.in</p>
                  <p><strong>Phone:</strong> +91 98765 43210</p>
                  <p><strong>Address:</strong> Plot No. 123, Cyber City, Gurugram, Haryana 122002</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RiskDisclaimer;