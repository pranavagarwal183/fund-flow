import { useAuth } from "./AuthProvider";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedPortfolioProps {
  children: ReactNode;
}

export default function ProtectedPortfolio({ children }: ProtectedPortfolioProps) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}