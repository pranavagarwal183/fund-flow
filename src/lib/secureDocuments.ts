import { supabase } from "@/integrations/supabase/client";

export interface DocumentAccessLog {
  id: string;
  user_id: string;
  document_type: string;
  bucket_name: string;
  file_path: string;
  access_type: 'VIEW' | 'DOWNLOAD' | 'UPLOAD';
  ip_address?: string | null;
  user_agent?: string | null;
  accessed_at: string;
  expires_at?: string | null;
}

/**
 * Secure document management service with enhanced logging and access control
 */
export class SecureDocumentService {
  /**
   * Upload KYC document with security logging
   */
  static async uploadKYCDocument(
    file: File,
    documentType: 'pan' | 'aadhaar' | 'bank_statement',
    userId: string
  ): Promise<{ path: string; url: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;
      
      // Upload to secure bucket
      const { data, error } = await supabase.storage
        .from('kyc-documents-secure')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Document upload error:', error);
        throw new Error('Failed to upload document');
      }

      // Log the upload
      await this.logDocumentAccess({
        document_type: documentType,
        bucket_name: 'kyc-documents-secure',
        file_path: fileName,
        access_type: 'UPLOAD'
      });

      // Generate secure URL
      const secureUrl = await this.getSecureDocumentUrl('kyc-documents-secure', fileName);

      return {
        path: fileName,
        url: secureUrl
      };
    } catch (error) {
      console.error('Secure document upload error:', error);
      throw error;
    }
  }

  /**
   * Get secure document URL with expiration and logging
   */
  static async getSecureDocumentUrl(
    bucketName: string,
    filePath: string,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    try {
      // Use the secure function to generate URL and log access
      const { data, error } = await supabase.rpc('get_secure_document_url', {
        bucket_name: bucketName,
        file_path: filePath,
        expires_in: expiresInSeconds
      });

      if (error) {
        console.error('Error getting secure document URL:', error);
        throw new Error('Failed to generate secure document URL');
      }

      // In production, this would return the actual signed URL
      // For now, return a placeholder that indicates secure access
      return data || `secure://${bucketName}/${filePath}`;
    } catch (error) {
      console.error('Secure document URL error:', error);
      throw error;
    }
  }

  /**
   * Log document access for audit trail
   */
  static async logDocumentAccess(params: {
    document_type: string;
    bucket_name: string;
    file_path: string;
    access_type: 'VIEW' | 'DOWNLOAD' | 'UPLOAD';
    expires_at?: string;
  }): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user for document access logging');
        return;
      }

      // Get user agent and approximate IP info
      const userAgent = navigator.userAgent;
      
      const { error } = await supabase
        .from('document_access_log')
        .insert({
          user_id: user.id,
          document_type: params.document_type,
          bucket_name: params.bucket_name,
          file_path: params.file_path,
          access_type: params.access_type,
          user_agent: userAgent,
          expires_at: params.expires_at
        });

      if (error) {
        console.error('Document access logging error:', error);
        // Don't throw error for logging failures - just log it
      }
    } catch (error) {
      console.error('Document access logging error:', error);
    }
  }

  /**
   * Get document access logs for current user
   */
  static async getDocumentAccessLogs(limit: number = 50): Promise<DocumentAccessLog[]> {
    try {
      const { data, error } = await supabase
        .from('document_access_log')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching document access logs:', error);
        throw new Error('Failed to fetch document access logs');
      }

      // Type cast to ensure proper typing
      return (data || []).map(log => ({
        ...log,
        access_type: log.access_type as 'VIEW' | 'DOWNLOAD' | 'UPLOAD',
        ip_address: log.ip_address as string | null,
        user_agent: log.user_agent as string | null,
        expires_at: log.expires_at as string | null
      }));
    } catch (error) {
      console.error('Document access logs fetch error:', error);
      throw error;
    }
  }

  /**
   * Delete KYC document with security logging
   */
  static async deleteKYCDocument(
    bucketName: string,
    filePath: string,
    documentType: string
  ): Promise<void> {
    try {
      // Log the deletion attempt first
      await this.logDocumentAccess({
        document_type: documentType,
        bucket_name: bucketName,
        file_path: filePath,
        access_type: 'VIEW' // Using VIEW as closest match for deletion
      });

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Document deletion error:', error);
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Secure document deletion error:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to document
   */
  static async verifyDocumentAccess(filePath: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      // Check if file path starts with user's ID
      return filePath.startsWith(user.id);
    } catch (error) {
      console.error('Document access verification error:', error);
      return false;
    }
  }
}

/**
 * Hook for secure document operations
 */
export const useSecureDocuments = () => {
  return {
    uploadKYCDocument: SecureDocumentService.uploadKYCDocument,
    getSecureDocumentUrl: SecureDocumentService.getSecureDocumentUrl,
    logDocumentAccess: SecureDocumentService.logDocumentAccess,
    getDocumentAccessLogs: SecureDocumentService.getDocumentAccessLogs,
    deleteKYCDocument: SecureDocumentService.deleteKYCDocument,
    verifyDocumentAccess: SecureDocumentService.verifyDocumentAccess,
  };
};