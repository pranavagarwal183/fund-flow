import { supabase } from "@/integrations/supabase/client";

export interface KYCDetails {
  id: string;
  user_id: string;
  pan_number: string | null;
  aadhaar_number: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_ifsc_code: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  verification_status: string | null;
  pan_verified: boolean | null;
  aadhaar_verified: boolean | null;
  bank_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface KYCDisplayCache {
  id: string;
  user_id: string;
  pan_number_masked: string | null;
  aadhaar_number_masked: string | null;
  bank_account_number_masked: string | null;
  bank_name: string | null;
  bank_ifsc_code: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  verification_status: string | null;
  pan_verified: boolean | null;
  aadhaar_verified: boolean | null;
  bank_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  cache_updated_at: string | null;
}

/**
 * Secure KYC operations that use audited database functions
 */
export class SecureKYCService {
  /**
   * Get KYC details securely with audit logging
   */
  static async getKYCDetails(): Promise<KYCDetails | null> {
    try {
      const { data, error } = await supabase.rpc('get_kyc_details_secure');
      
      if (error) {
        console.error('Error fetching KYC details:', error);
        throw new Error('Failed to fetch KYC details');
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('KYC fetch error:', error);
      throw error;
    }
  }

  /**
   * Update KYC details securely with audit logging
   */
  static async updateKYCDetails(updates: {
    pan_number?: string;
    aadhaar_number?: string;
    bank_account_number?: string;
    bank_name?: string;
    bank_ifsc_code?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  }): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('update_kyc_details_secure', {
        p_pan_number: updates.pan_number || null,
        p_aadhaar_number: updates.aadhaar_number || null,
        p_bank_account_number: updates.bank_account_number || null,
        p_bank_name: updates.bank_name || null,
        p_bank_ifsc_code: updates.bank_ifsc_code || null,
        p_address_line1: updates.address_line1 || null,
        p_address_line2: updates.address_line2 || null,
        p_city: updates.city || null,
        p_state: updates.state || null,
        p_pincode: updates.pincode || null,
        p_country: updates.country || null,
      });
      
      if (error) {
        console.error('Error updating KYC details:', error);
        throw new Error('Failed to update KYC details');
      }
      
      // Refresh the display cache after update
      await this.refreshDisplayCache();
      
      return data;
    } catch (error) {
      console.error('KYC update error:', error);
      throw error;
    }
  }

  /**
   * Get masked KYC data for display purposes
   */
  static async getKYCDisplayData(): Promise<KYCDisplayCache | null> {
    try {
      // First refresh the cache to ensure it's up to date
      await this.refreshDisplayCache();
      
      const { data, error } = await supabase
        .from('kyc_display_cache')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching KYC display data:', error);
        throw new Error('Failed to fetch KYC display data');
      }
      
      return data || null;
    } catch (error) {
      console.error('KYC display fetch error:', error);
      throw error;
    }
  }

  /**
   * Refresh the display cache
   */
  static async refreshDisplayCache(): Promise<void> {
    try {
      const { error } = await supabase.rpc('refresh_kyc_display_cache');
      
      if (error) {
        console.error('Error refreshing KYC display cache:', error);
        throw new Error('Failed to refresh display cache');
      }
    } catch (error) {
      console.error('Cache refresh error:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for the current user's KYC access
   */
  static async getAuditLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('kyc_audit_log')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        throw new Error('Failed to fetch audit logs');
      }
      
      return data || [];
    } catch (error) {
      console.error('Audit logs fetch error:', error);
      throw error;
    }
  }

  /**
   * Validate sensitive data format before submission using enhanced security functions
   */
  static validateSensitiveData(data: {
    pan_number?: string;
    aadhaar_number?: string;
    bank_account_number?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Use the enhanced validation from security.ts
    const { validatePAN, validateAadhaar, validateBankAccount } = require('./security');
    
    // PAN validation
    if (data.pan_number) {
      const panResult = validatePAN(data.pan_number);
      if (!panResult.isValid) {
        errors.push(panResult.message || 'Invalid PAN format');
      }
    }
    
    // Aadhaar validation
    if (data.aadhaar_number) {
      const aadhaarResult = validateAadhaar(data.aadhaar_number);
      if (!aadhaarResult.isValid) {
        errors.push(aadhaarResult.message || 'Invalid Aadhaar format');
      }
    }
    
    // Bank account validation
    if (data.bank_account_number) {
      const bankResult = validateBankAccount(data.bank_account_number);
      if (!bankResult.isValid) {
        errors.push(bankResult.message || 'Invalid bank account format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get enhanced security metrics and alerts
   */
  static async getSecurityMetrics(): Promise<{
    recentAccess: number;
    suspiciousActivity: boolean;
    lastCacheRefresh: string | null;
    documentsAccessed: number;
  }> {
    try {
      // Get recent audit logs
      const auditLogs = await this.getAuditLogs();
      const recentAccess = auditLogs.filter(log => {
        const accessTime = new Date(log.accessed_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return accessTime > oneHourAgo;
      }).length;

      // Check for suspicious patterns (multiple rapid access attempts)
      const suspiciousActivity = recentAccess > 10;

      // Get last cache refresh
      const cacheRefreshLogs = auditLogs.filter(log => log.action === 'CACHE_REFRESH');
      const lastCacheRefresh = cacheRefreshLogs[0]?.accessed_at || null;

      // Count document access logs
      const documentLogs = auditLogs.filter(log => log.action === 'DOCUMENT_ACCESS');
      const documentsAccessed = documentLogs.length;

      return {
        recentAccess,
        suspiciousActivity,
        lastCacheRefresh,
        documentsAccessed
      };
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return {
        recentAccess: 0,
        suspiciousActivity: false,
        lastCacheRefresh: null,
        documentsAccessed: 0
      };
    }
  }
}

/**
 * Hook for secure KYC operations
 */
export const useSecureKYC = () => {
  return {
    getKYCDetails: SecureKYCService.getKYCDetails,
    updateKYCDetails: SecureKYCService.updateKYCDetails,
    getKYCDisplayData: SecureKYCService.getKYCDisplayData,
    refreshDisplayCache: SecureKYCService.refreshDisplayCache,
    getAuditLogs: SecureKYCService.getAuditLogs,
    validateSensitiveData: SecureKYCService.validateSensitiveData,
  };
};