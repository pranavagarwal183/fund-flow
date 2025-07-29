import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from "axios";
import { ErrorHandler, createAppError, ErrorType } from "./error-handler";
import { createRateLimiter } from "./validation";

/**
 * API Response wrapper type
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  rateLimiting?: {
    maxRequests: number;
    windowMs: number;
  };
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
}

/**
 * Secure API Client with comprehensive error handling and security features
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private rateLimiter: ReturnType<typeof createRateLimiter> | null = null;
  private retryConfig: { maxRetries: number; retryDelay: number };

  constructor(config: ApiClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      withCredentials: false, // Set to true if you need to send cookies
    });

    this.retryConfig = config.retryConfig || { maxRetries: 3, retryDelay: 1000 };

    // Initialize rate limiter if configured
    if (config.rateLimiting) {
      this.rateLimiter = createRateLimiter(
        config.rateLimiting.maxRequests,
        config.rateLimiting.windowMs
      );
    }

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now(),
        };

        // Add CSRF token if available
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }

        // Add auth token if available
        const authToken = this.getAuthToken();
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }

        // Apply rate limiting
        if (this.rateLimiter) {
          const clientId = this.getClientIdentifier();
          const rateLimitResult = this.rateLimiter(clientId);
          
          if (!rateLimitResult.allowed) {
            return Promise.reject(
              createAppError(
                ErrorType.CLIENT,
                "Rate limit exceeded",
                {
                  code: 429,
                  userMessage: "Too many requests. Please try again later.",
                  details: { resetTime: rateLimitResult.resetTime },
                }
              )
            );
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Log successful requests in development
        if (process.env.NODE_ENV === "development") {
          console.log("API Response:", {
            url: response.config.url,
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(this.handleError(refreshError));
          }
        }

        // Handle retry for 5xx errors
        if (
          error.response?.status &&
          error.response.status >= 500 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          return this.retryRequest(originalRequest, error);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      
      if (response) {
        // Server responded with error status
        return createAppError(
          this.getErrorType(response.status),
          response.data?.message || error.message,
          {
            code: response.status,
            details: response.data,
            userMessage: this.getUserMessage(response.status),
          }
        );
      } else if (error.request) {
        // Network error
        return createAppError(
          ErrorType.NETWORK,
          "Network error occurred",
          {
            userMessage: "Please check your internet connection and try again.",
            details: error.message,
          }
        );
      }
    }

    // Unknown error
    return createAppError(
      ErrorType.UNKNOWN,
      "An unexpected error occurred",
      {
        userMessage: "Something went wrong. Please try again.",
        details: error,
      }
    );
  }

  /**
   * Get error type based on HTTP status code
   */
  private getErrorType(status: number): ErrorType {
    if (status >= 500) return ErrorType.SERVER;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 401 || status === 403) return ErrorType.AUTHORIZATION;
    if (status >= 400) return ErrorType.CLIENT;
    return ErrorType.UNKNOWN;
  }

  /**
   * Get user-friendly message based on HTTP status code
   */
  private getUserMessage(status: number): string {
    switch (status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Please log in to access this resource.";
      case 403:
        return "You don't have permission to access this resource.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "We're experiencing technical difficulties. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  }

  /**
   * Retry failed requests
   */
  private async retryRequest(
    originalRequest: AxiosRequestConfig,
    error: AxiosError
  ): Promise<AxiosResponse> {
    let retries = 0;
    const maxRetries = this.retryConfig.maxRetries;
    const baseDelay = this.retryConfig.retryDelay;

    while (retries < maxRetries) {
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, retries);
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        return await this.axiosInstance(originalRequest);
      } catch (retryError) {
        retries++;
        if (retries >= maxRetries) {
          throw retryError;
        }
      }
    }

    throw error;
  }

  /**
   * Get CSRF token from meta tag or cookie
   */
  private getCSRFToken(): string | null {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute("content");
    }

    // Try to get from cookie
    const csrfCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="));
    
    return csrfCookie ? csrfCookie.split("=")[1] : null;
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem("auth_token");
    } catch {
      return null;
    }
  }

  /**
   * Get client identifier for rate limiting
   */
  private getClientIdentifier(): string {
    // In a real app, you might use user ID or IP address
    // For now, we'll use a combination of session storage and timestamp
    let clientId = sessionStorage.getItem("client_id");
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("client_id", clientId);
    }
    return clientId;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post("/api/auth/refresh", {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      localStorage.setItem("auth_token", access_token);
      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken);
      }
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  /**
   * Logout user and clear tokens
   */
  private logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("client_id");
    
    // Redirect to login page or dispatch logout action
    window.location.href = "/login";
  }

  /**
   * Public API methods
   */

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  async post<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  async put<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  async patch<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }
}

/**
 * Create and export a configured API client instance
 */
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30000,
  rateLimiting: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
});

export default apiClient;