import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  variant?: "spinner" | "skeleton" | "dots" | "pulse";
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

/**
 * Loading component with multiple variants for different loading states
 */
export const Loading = ({ 
  variant = "spinner", 
  size = "md", 
  className,
  text 
}: LoadingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
          {text && <span className="text-sm text-muted-foreground">{text}</span>}
        </div>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-1", className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && <span className="ml-3 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="bg-gray-200 rounded-md h-8 w-full"></div>
        {text && <div className="text-center mt-2 text-sm text-muted-foreground">{text}</div>}
      </div>
    );
  }

  return null;
};

/**
 * Full screen loading overlay
 */
export const LoadingOverlay = ({ text = "Loading..." }: { text?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <Loading variant="spinner" size="lg" text={text} />
  </div>
);

/**
 * Card skeleton for loading states
 */
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("p-6 border rounded-lg", className)}>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
    </div>
  </div>
);

/**
 * Table skeleton for loading states
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    ))}
  </div>
);