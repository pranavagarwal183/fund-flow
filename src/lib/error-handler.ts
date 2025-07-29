import { toast } from "sonner";

/**
 * Types for different error categories
 */
export enum ErrorType {
  NETWORK = "network",
  VALIDATION = "validation",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

/**
 * Structured error interface
 */
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: unknown;
  timestamp: Date;
  userMessage?: string;
}

/**
 * Create a structured application error
 */
export const createAppError = (
  type: ErrorType,
  message: string,
  options?: {
    code?: string | number;
    details?: unknown;
    userMessage?: string;
  }
): AppError => ({
  type,
  message,
  code: options?.code,
  details: options?.details,
  userMessage: options?.userMessage,
  timestamp: new Date(),
});

/**
 * Error handler that provides consistent error processing and user feedback
 */
export class ErrorHandler {
  /**
   * Handle and display API errors
   */
  static handleApiError(error: unknown): AppError {
    let appError: AppError;

    if (error instanceof Response) {
      // Handle HTTP response errors
      const status = error.status;
      const statusText = error.statusText;

      if (status >= 500) {
        appError = createAppError(
          ErrorType.SERVER,
          `Server error: ${statusText}`,
          {
            code: status,
            userMessage: "We're experiencing technical difficulties. Please try again later.",
          }
        );
      } else if (status === 404) {
        appError = createAppError(
          ErrorType.NOT_FOUND,
          "Resource not found",
          {
            code: status,
            userMessage: "The requested resource was not found.",
          }
        );
      } else if (status === 401 || status === 403) {
        appError = createAppError(
          ErrorType.AUTHORIZATION,
          "Unauthorized access",
          {
            code: status,
            userMessage: "You don't have permission to access this resource.",
          }
        );
      } else if (status >= 400) {
        appError = createAppError(
          ErrorType.CLIENT,
          `Client error: ${statusText}`,
          {
            code: status,
            userMessage: "There was an error with your request. Please check and try again.",
          }
        );
      } else {
        appError = createAppError(
          ErrorType.UNKNOWN,
          `Unexpected response: ${statusText}`,
          { code: status }
        );
      }
    } else if (error instanceof Error) {
      // Handle JavaScript errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        appError = createAppError(
          ErrorType.NETWORK,
          "Network connection error",
          {
            details: error.message,
            userMessage: "Please check your internet connection and try again.",
          }
        );
      } else {
        appError = createAppError(
          ErrorType.CLIENT,
          error.message,
          {
            details: error.stack,
            userMessage: "An unexpected error occurred. Please try again.",
          }
        );
      }
    } else {
      // Handle unknown error types
      appError = createAppError(
        ErrorType.UNKNOWN,
        "An unknown error occurred",
        {
          details: error,
          userMessage: "Something went wrong. Please try again.",
        }
      );
    }

    // Log error for debugging
    console.error("Error handled:", appError);

    // Show user notification
    this.showErrorNotification(appError);

    return appError;
  }

  /**
   * Handle form validation errors
   */
  static handleValidationError(
    fieldErrors: Record<string, string[]>
  ): AppError {
    const firstError = Object.values(fieldErrors)[0]?.[0];
    const appError = createAppError(
      ErrorType.VALIDATION,
      "Validation failed",
      {
        details: fieldErrors,
        userMessage: firstError || "Please check your input and try again.",
      }
    );

    this.showErrorNotification(appError);
    return appError;
  }

  /**
   * Show error notification to user
   */
  static showErrorNotification(error: AppError): void {
    const message = error.userMessage || error.message;
    
    switch (error.type) {
      case ErrorType.NETWORK:
        toast.error("Connection Error", {
          description: message,
          duration: 5000,
        });
        break;
      case ErrorType.VALIDATION:
        toast.error("Validation Error", {
          description: message,
          duration: 4000,
        });
        break;
      case ErrorType.AUTHORIZATION:
        toast.error("Access Denied", {
          description: message,
          duration: 4000,
        });
        break;
      case ErrorType.NOT_FOUND:
        toast.error("Not Found", {
          description: message,
          duration: 4000,
        });
        break;
      case ErrorType.SERVER:
        toast.error("Server Error", {
          description: message,
          duration: 6000,
        });
        break;
      default:
        toast.error("Error", {
          description: message,
          duration: 4000,
        });
    }
  }

  /**
   * Show success notification
   */
  static showSuccessNotification(
    message: string,
    description?: string
  ): void {
    toast.success(message, {
      description,
      duration: 3000,
    });
  }

  /**
   * Show info notification
   */
  static showInfoNotification(
    message: string,
    description?: string
  ): void {
    toast.info(message, {
      description,
      duration: 3000,
    });
  }

  /**
   * Show warning notification
   */
  static showWarningNotification(
    message: string,
    description?: string
  ): void {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  }
}

/**
 * Async wrapper that handles errors consistently
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  customErrorMessage?: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const appError = ErrorHandler.handleApiError(error);
    if (customErrorMessage) {
      appError.userMessage = customErrorMessage;
      ErrorHandler.showErrorNotification(appError);
    }
    return null;
  }
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
};