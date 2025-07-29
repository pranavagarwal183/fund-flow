import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Menu, 
  X, 
  Calculator, 
  PieChart, 
  Target, 
  User,
  ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent body scroll when menu is open
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, closeMenu]);

  const navigationItems = [
    { href: "/services", label: "Services", icon: TrendingUp },
    { href: "/dashboard", label: "My Journey", icon: PieChart },
    { href: "/funds", label: "Portfolio", icon: TrendingUp },
    { href: "/watchlist", label: "Watchlist", icon: Target },
    { href: "/reports", label: "Reports", icon: Target },
    { href: "/calculators", label: "Calculators", icon: Calculator },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-200",
        isScrolled 
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm" 
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            aria-label="FundFlow - Go to homepage"
          >
            <div className="bg-gradient-primary p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className={cn(
                    "flex items-center space-x-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.href === "/calculators" && <Icon className="h-4 w-4" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <User className="h-4 w-4 mr-2" aria-hidden="true" />
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen 
              ? "max-h-96 opacity-100" 
              : "max-h-0 opacity-0"
          )}
          aria-hidden={!isMenuOpen}
        >
          <div className="py-4 border-t bg-background/95">
            <nav 
              className="flex flex-col space-y-1"
              role="navigation" 
              aria-label="Mobile navigation"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link 
                    key={item.href}
                    to={item.href} 
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors rounded-md mx-2",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "min-h-[48px]", // Ensure minimum touch target size
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:text-primary hover:bg-accent"
                    )}
                    onClick={closeMenu}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Action Buttons */}
              <div className="flex flex-col space-y-3 pt-4 px-4 border-t mt-4">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="justify-start min-h-[48px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={closeMenu}
                >
                  <User className="h-5 w-5 mr-3" aria-hidden="true" />
                  Sign In
                </Button>
                <Button 
                  size="lg" 
                  className="bg-gradient-primary justify-start min-h-[48px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={closeMenu}
                >
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};