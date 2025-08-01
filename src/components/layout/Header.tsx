import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  Menu,
  X,
  Calculator,
  PieChart,
  Target,
  User,
  BarChart3,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "../AuthProvider"; // Adjust path as needed
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              to="/goals"
              className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Calculator className="h-4 w-4" />
              <span>Goal Planner</span>
            </Link>

            {/* Dropdown for Insights */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium px-2">
                  Insights
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center space-x-2">
                    <PieChart className="h-4 w-4" />
                    <span>My Journey</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/funds" className="flex items-center space-x-2">
                    <FolderKanban className="h-4 w-4" />
                    <span>Portfolio</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/reports" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-gradient-primary" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
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
                to="/goals"
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calculator className="h-4 w-4" />
                <span>Goal Planner</span>
              </Link>

              {/* Mobile Insights Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="insights">
                  <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-primary">
                    Insights
                  </AccordionTrigger>
                  <AccordionContent className="pl-4">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <PieChart className="h-4 w-4" />
                      <span>My Journey</span>
                    </Link>
                    <Link
                      to="/funds"
                      className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FolderKanban className="h-4 w-4" />
                      <span>Portfolio</span>
                    </Link>
                    <Link
                      to="/reports"
                      className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Reports</span>
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Mobile Auth */}
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground px-2">{user.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link to="/login">
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" className="bg-gradient-primary justify-start" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
