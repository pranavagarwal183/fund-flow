import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Funds from "./pages/Funds";
import Watchlist from "./pages/Watchlist";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import Calculators from "./pages/Calculators";
import MutualFunds from "./pages/MutualFunds";
import RiskDisclaimer from "./pages/RiskDisclaimer";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import PortfolioAnalysis from "./pages/PortfolioAnalysis";
import Learn from "./pages/Learn";

// Import AuthProvider and ProtectedRoute
import { AuthProvider } from "./components/AuthProvider";
// import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

// Scroll restoration component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/mutual-funds" element={<MutualFunds />} />
            <Route path="/portfolio-analysis" element={<PortfolioAnalysis />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/risk-disclaimer" element={<RiskDisclaimer />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;