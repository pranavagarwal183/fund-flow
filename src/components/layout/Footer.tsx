import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
  FileText
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="bg-primary p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">FundFlow</span>
            </Link>
            
            <p className="text-background/80 mb-6 leading-relaxed">
              India's most trusted AI-powered mutual fund investment platform. 
              Build wealth systematically with personalized recommendations.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="bg-background/10 hover:bg-background/20 p-2 rounded-lg transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-background/10 hover:bg-background/20 p-2 rounded-lg transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-background/10 hover:bg-background/20 p-2 rounded-lg transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-background/10 hover:bg-background/20 p-2 rounded-lg transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-background/80 hover:text-background transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/funds" className="text-background/80 hover:text-background transition-colors">
                  Explore Funds
                </Link>
              </li>
              <li>
                <Link to="/calculators" className="text-background/80 hover:text-background transition-colors">
                  Calculators
                </Link>
              </li>
              <li>
                <Link to="/goals" className="text-background/80 hover:text-background transition-colors">
                  Goal Planning
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-background/80 hover:text-background transition-colors">
                  My Portfolio
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/mutual-funds" className="text-background/80 hover:text-background transition-colors">
                  Mutual Fund Education
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/80 hover:text-background transition-colors">
                  Investment Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-background/80 hover:text-background transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/webinars" className="text-background/80 hover:text-background transition-colors">
                  Webinars
                </Link>
              </li>
              <li>
                <Link to="/tax-center" className="text-background/80 hover:text-background transition-colors">
                  Tax Center
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-background/80">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-background/80">support@fundflow.in</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <span className="text-background/80">
                  Plot No. 123, Cyber City,<br />
                  Gurugram, Haryana 122002
                </span>
              </div>
            </div>
            
            {/* Compliance Info */}
            <div className="mt-6 pt-6 border-t border-background/20">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-background/80">SEBI Reg: INH000001234</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm text-background/80">AMFI Reg: ARN-12345</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-background/80 text-sm">
              © 2024 FundFlow. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end space-x-6 text-sm">
              <Link to="/privacy" className="text-background/80 hover:text-background transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-background/80 hover:text-background transition-colors">
                Terms of Service
              </Link>
              <Link to="/risk-disclaimer" className="text-background/80 hover:text-background transition-colors">
                Risk Disclaimer
              </Link>
              <Link to="/grievance" className="text-background/80 hover:text-background transition-colors">
                Grievance Policy
              </Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-background/20 text-xs text-background/60 text-center">
            <p>
              For detailed risk information and disclaimers, please visit our{" "}
              <Link to="/risk-disclaimer" className="text-primary hover:underline">
                Risk Disclaimer
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};