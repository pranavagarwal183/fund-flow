import { z } from "zod";

/**
 * Common validation schemas for input sanitization and validation
 */

// Basic string validation with XSS protection
export const sanitizedString = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(val), {
    message: "Script tags are not allowed",
  })
  .refine((val) => !/javascript:/gi.test(val), {
    message: "JavaScript protocols are not allowed",
  });

// Email validation
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long")
  .transform((val) => val.toLowerCase().trim());

// Phone number validation (Indian format)
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
  .transform((val) => val.replace(/\D/g, ""));

// PAN validation (Indian PAN format)
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number")
  .transform((val) => val.toUpperCase().trim());

// Amount validation (positive numbers with up to 2 decimal places)
export const amountSchema = z
  .number()
  .positive("Amount must be positive")
  .max(10000000, "Amount cannot exceed ₹1 crore")
  .refine((val) => Number.isFinite(val), "Please enter a valid amount");

// SIP amount validation
export const sipAmountSchema = z
  .number()
  .min(500, "Minimum SIP amount is ₹500")
  .max(1000000, "Maximum SIP amount is ₹10 lakh")
  .refine((val) => val % 100 === 0, "SIP amount should be in multiples of ₹100");

// Password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name cannot exceed 50 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
  .transform((val) => val.trim().replace(/\s+/g, " "));

// Date validation
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)")
  .refine((val) => {
    const date = new Date(val);
    return date instanceof Date && !isNaN(date.getTime());
  }, "Please enter a valid date");

// Age validation (18-100 years)
export const ageSchema = z
  .number()
  .int("Age must be a whole number")
  .min(18, "You must be at least 18 years old")
  .max(100, "Please enter a valid age");

/**
 * Form validation schemas
 */

// User registration schema
export const userRegistrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  dateOfBirth: dateSchema,
  pan: panSchema,
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// SIP investment schema
export const sipInvestmentSchema = z.object({
  fundId: z.string().min(1, "Please select a fund"),
  amount: sipAmountSchema,
  frequency: z.enum(["monthly", "quarterly", "yearly"], {
    errorMap: () => ({ message: "Please select a valid frequency" }),
  }),
  startDate: dateSchema.refine((val) => {
    const date = new Date(val);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date >= tomorrow;
  }, "Start date must be at least tomorrow"),
  duration: z.number().min(12, "Minimum SIP duration is 12 months").max(600, "Maximum SIP duration is 50 years"),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: sanitizedString.min(5, "Subject must be at least 5 characters long").max(100, "Subject cannot exceed 100 characters"),
  message: sanitizedString.min(10, "Message must be at least 10 characters long").max(1000, "Message cannot exceed 1000 characters"),
});

// Search query schema
export const searchQuerySchema = z.object({
  query: sanitizedString
    .min(1, "Search query cannot be empty")
    .max(100, "Search query cannot exceed 100 characters")
    .refine((val) => !/[<>\"']/.test(val), {
      message: "Search query contains invalid characters",
    }),
  category: z.enum(["all", "equity", "debt", "hybrid", "etf"]).optional(),
  sortBy: z.enum(["name", "returns", "rating", "aum"]).optional(),
  limit: z.number().min(1).max(50).optional(),
});

/**
 * Utility functions for validation and sanitization
 */

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Remove all HTML tags
export const stripHtml = (input: string): string => {
  return input.replace(/<[^>]*>/g, "");
};

// Validate and sanitize URL
export const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Check if string contains only alphanumeric characters
export const isAlphanumeric = (input: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(input);
};

// Validate file upload
export const validateFileUpload = (file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
} = {}): { isValid: boolean; error?: string } => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] } = options;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { isValid: true };
};

// Rate limiting validation
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): { allowed: boolean; remainingRequests: number; resetTime: number } => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const userRequests = requests.get(identifier) || [];
    
    // Filter out requests outside the current window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if user has exceeded the limit
    if (validRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + windowMs;
      
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime,
      };
    }

    // Add current request
    validRequests.push(now);
    requests.set(identifier, validRequests);

    return {
      allowed: true,
      remainingRequests: maxRequests - validRequests.length,
      resetTime: now + windowMs,
    };
  };
};

/**
 * Export validation result type for type safety
 */
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Generic validation function
 */
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ["Validation failed"] } };
  }
};