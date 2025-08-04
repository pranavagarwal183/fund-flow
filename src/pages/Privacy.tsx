import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                At Agarwal Financial Services, we collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Name and contact information</li>
                <li>Purchase history</li>
                <li>Payment information</li>
                <li>Communication preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Process your purchases</li>
                <li>Communicate with you about our products and services</li>
                <li>Improve our customer service</li>
                <li>Send promotional materials (with your consent)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Information Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                We implement appropriate security measures to protect your personal information and maintain its confidentiality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Data portability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                For any privacy-related questions or concerns, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-foreground"><strong>Phone:</strong> +91 982448111</p>
                <p className="text-foreground"><strong>Alternative Phone:</strong> +91 9824448113</p>
                <p className="text-foreground">
                  <strong>Address:</strong> 318, Pride Sapphire, Opposite Golden Supermarket, Off Amin Marg, Rajkot, Gujarat, India - 360001
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Updates to Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                We may update this privacy policy from time to time. The latest version will always be available on our website.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;