import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Menu, 
  X, 
  Calculator, 
  PieChart, 
  Target, 
  User 
} from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              My Journey
            </Link>
            <Link to="/funds" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Portfolio
            </Link>
            <Link to="/watchlist" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Watchlist
            </Link>
            <Link to="/reports" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Reports
            </Link>
            <Link to="/calculators" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <Calculator className="h-4 w-4" />
              <span>Calculators</span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-gradient-primary">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/services" 
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Services</span>
              </Link>
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <PieChart className="h-4 w-4" />
                <span>My Journey</span>
              </Link>
              <Link 
                to="/funds" 
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Portfolio</span>
              </Link>
              <Link 
                to="/watchlist" 
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Target className="h-4 w-4" />
                <span>Watchlist</span>
              </Link>
              <Link 
                to="/reports" 
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Target className="h-4 w-4" />
                <span>Reports</span>
              </Link>
              <Link 
                to="/calculators" 
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calculator className="h-4 w-4" />
                <span>Calculators</span>
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" size="sm" className="justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button size="sm" className="bg-gradient-primary justify-start">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};