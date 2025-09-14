// Security utilities for input validation and sanitization

/**
 * Validates password strength according to security requirements
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  
  return { isValid: true };
}

/**
 * Validates Indian PAN number format and basic checksum
 */
export function validatePAN(pan: string): { isValid: boolean; message?: string } {
  if (!pan || typeof pan !== 'string') {
    return { isValid: false, message: "PAN number is required" };
  }
  
  const cleanPAN = pan.toUpperCase().trim();
  
  // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(cleanPAN)) {
    return { isValid: false, message: "Invalid PAN format. Expected format: ABCDE1234F" };
  }
  
  // Check for invalid patterns
  const invalidPatterns = [
    /^[A-Z]{5}0000[A-Z]$/, // All zeros in digit section
    /^AAAAA\d{4}[A-Z]$/, // All same letters
    /^[A-Z]{5}\d{4}A$/ // Last letter should not be 'A' for individuals
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(cleanPAN)) {
      return { isValid: false, message: "Invalid PAN number pattern detected" };
    }
  }
  
  return { isValid: true };
}

/**
 * Validates Indian Aadhaar number format and basic checksum
 */
export function validateAadhaar(aadhaar: string): { isValid: boolean; message?: string } {
  if (!aadhaar || typeof aadhaar !== 'string') {
    return { isValid: false, message: "Aadhaar number is required" };
  }
  
  const cleanAadhaar = aadhaar.replace(/\s/g, '').trim();
  
  // Aadhaar format: 12 digits
  const aadhaarRegex = /^[0-9]{12}$/;
  
  if (!aadhaarRegex.test(cleanAadhaar)) {
    return { isValid: false, message: "Invalid Aadhaar format. Must be 12 digits" };
  }
  
  // Check for invalid patterns
  if (cleanAadhaar === '000000000000' || cleanAadhaar === '111111111111') {
    return { isValid: false, message: "Invalid Aadhaar number pattern detected" };
  }
  
  // Check if all digits are the same
  if (/^(\d)\1{11}$/.test(cleanAadhaar)) {
    return { isValid: false, message: "Invalid Aadhaar number - all digits cannot be the same" };
  }
  
  // Basic Verhoeff algorithm check (simplified)
  if (!verifyAadhaarChecksum(cleanAadhaar)) {
    return { isValid: false, message: "Invalid Aadhaar number - checksum validation failed" };
  }
  
  return { isValid: true };
}

/**
 * Simplified Verhoeff algorithm for Aadhaar validation
 */
function verifyAadhaarChecksum(aadhaar: string): boolean {
  const multiplication = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  
  const permutation = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];
  
  let c = 0;
  const reversedArray = aadhaar.split('').map(Number).reverse();
  
  for (let i = 0; i < reversedArray.length; i++) {
    c = multiplication[c][permutation[((i + 1) % 8)][reversedArray[i]]];
  }
  
  return c === 0;
}

/**
 * Validates Indian phone number format
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; message?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: "Phone number is required" };
  }
  
  const cleanPhone = phone.replace(/\s|-|\+91/g, '').trim();
  
  // Indian mobile number: 10 digits starting with 6, 7, 8, or 9
  const phoneRegex = /^[6-9][0-9]{9}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: "Invalid phone number. Must be 10 digits starting with 6, 7, 8, or 9" };
  }
  
  return { isValid: true };
}

/**
 * Validates bank account number format
 */
export function validateBankAccount(accountNumber: string): { isValid: boolean; message?: string } {
  if (!accountNumber || typeof accountNumber !== 'string') {
    return { isValid: false, message: "Bank account number is required" };
  }
  
  const cleanAccount = accountNumber.replace(/\s/g, '').trim();
  
  // Bank account: 9-20 digits
  const accountRegex = /^[0-9]{9,20}$/;
  
  if (!accountRegex.test(cleanAccount)) {
    return { isValid: false, message: "Invalid bank account number. Must be 9-20 digits" };
  }
  
  return { isValid: true };
}

/**
 * Validates IFSC code format
 */
export function validateIFSC(ifsc: string): { isValid: boolean; message?: string } {
  if (!ifsc || typeof ifsc !== 'string') {
    return { isValid: false, message: "IFSC code is required" };
  }
  
  const cleanIFSC = ifsc.toUpperCase().trim();
  
  // IFSC format: 4 letters, 7 characters (letters or digits)
  const ifscRegex = /^[A-Z]{4}[A-Z0-9]{7}$/;
  
  if (!ifscRegex.test(cleanIFSC)) {
    return { isValid: false, message: "Invalid IFSC code format. Expected format: ABCD0123456" };
  }
  
  return { isValid: true };
}

/**
 * Sanitizes input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    });
}

/**
 * Rate limiting check for client-side
 */
export class ClientRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private maxAttempts: number = 5, private windowMs: number = 15 * 60 * 1000) {}
  
  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;
    
    const remaining = attempt.resetTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

// Global rate limiter instances
export const authRateLimit = new ClientRateLimit(3, 15 * 60 * 1000); // 3 attempts per 15 minutes
export const kycRateLimit = new ClientRateLimit(5, 60 * 1000); // 5 attempts per minute