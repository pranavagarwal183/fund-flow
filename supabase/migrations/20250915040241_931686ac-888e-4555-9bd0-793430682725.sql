-- Enhanced Security for KYC Documents and Pattern-Resistant Masking

-- 1. Create secure storage policies for KYC documents
CREATE POLICY "Users can upload their own KYC documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id IN ('kyc-documents', 'kyc-documents-secure') 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own KYC documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id IN ('kyc-documents', 'kyc-documents-secure') 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own KYC documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id IN ('kyc-documents', 'kyc-documents-secure') 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own KYC documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id IN ('kyc-documents', 'kyc-documents-secure') 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

-- 2. Enhanced masking function with pattern resistance
CREATE OR REPLACE FUNCTION public.mask_sensitive_data_enhanced(data_type text, value text, user_salt text DEFAULT NULL)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  salt_value text;
  hash_input text;
  pattern_variation integer;
BEGIN
  -- Use user_id as salt for consistent but unpredictable masking per user
  salt_value := COALESCE(user_salt, auth.uid()::text, 'default_salt');
  hash_input := salt_value || data_type || value;
  
  -- Generate a pattern variation based on hash (0-2)
  pattern_variation := (abs(hashtext(hash_input)) % 3);
  
  CASE data_type
    WHEN 'pan' THEN
      CASE pattern_variation
        WHEN 0 THEN RETURN CASE WHEN length(value) >= 10 THEN '**CDE' || substring(value, 6, 2) || '**F' ELSE '***' END;
        WHEN 1 THEN RETURN CASE WHEN length(value) >= 10 THEN 'AB**E' || substring(value, 8, 1) || '***' ELSE '***' END;
        ELSE RETURN CASE WHEN length(value) >= 10 THEN '***' || substring(value, 4, 3) || '***' ELSE '***' END;
      END CASE;
    WHEN 'aadhaar' THEN
      CASE pattern_variation
        WHEN 0 THEN RETURN CASE WHEN length(value) >= 12 THEN '****' || substring(value, 3, 2) || '******' ELSE '***' END;
        WHEN 1 THEN RETURN CASE WHEN length(value) >= 12 THEN '**' || substring(value, 7, 3) || '*****' ELSE '***' END;
        ELSE RETURN CASE WHEN length(value) >= 12 THEN '*****' || substring(value, 9, 2) || '*****' ELSE '***' END;
      END CASE;
    WHEN 'bank_account' THEN
      CASE pattern_variation
        WHEN 0 THEN RETURN CASE WHEN length(value) >= 8 THEN '****' || substring(value, 3, 2) || '**' ELSE '***' END;
        WHEN 1 THEN RETURN CASE WHEN length(value) >= 8 THEN '**' || substring(value, 5, 3) || '***' ELSE '***' END;
        ELSE RETURN CASE WHEN length(value) >= 8 THEN '***' || substring(value, -3, 2) || '*' ELSE '***' END;
      END CASE;
    ELSE
      RETURN '***';
  END CASE;
END;
$function$;

-- 3. Update the display cache refresh function to use enhanced masking
CREATE OR REPLACE FUNCTION public.refresh_kyc_display_cache()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  kyc_record RECORD;
  user_salt text;
BEGIN
  -- Get the user's KYC details
  SELECT * INTO kyc_record FROM public.kyc_details WHERE user_id = auth.uid();
  
  -- Generate user-specific salt for consistent masking
  user_salt := auth.uid()::text;
  
  IF FOUND THEN
    -- Update or insert cached display data with enhanced masking
    INSERT INTO public.kyc_display_cache (
      user_id,
      pan_number_masked,
      aadhaar_number_masked,
      bank_account_number_masked,
      bank_name,
      bank_ifsc_code,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      country,
      verification_status,
      pan_verified,
      aadhaar_verified,
      bank_verified,
      created_at,
      updated_at,
      cache_updated_at
    ) VALUES (
      auth.uid(),
      public.mask_sensitive_data_enhanced('pan', kyc_record.pan_number, user_salt),
      public.mask_sensitive_data_enhanced('aadhaar', kyc_record.aadhaar_number, user_salt),
      public.mask_sensitive_data_enhanced('bank_account', kyc_record.bank_account_number, user_salt),
      kyc_record.bank_name,
      kyc_record.bank_ifsc_code,
      kyc_record.address_line1,
      kyc_record.address_line2,
      kyc_record.city,
      kyc_record.state,
      kyc_record.pincode,
      kyc_record.country,
      kyc_record.verification_status,
      kyc_record.pan_verified,
      kyc_record.aadhaar_verified,
      kyc_record.bank_verified,
      kyc_record.created_at,
      kyc_record.updated_at,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      pan_number_masked = public.mask_sensitive_data_enhanced('pan', kyc_record.pan_number, user_salt),
      aadhaar_number_masked = public.mask_sensitive_data_enhanced('aadhaar', kyc_record.aadhaar_number, user_salt),
      bank_account_number_masked = public.mask_sensitive_data_enhanced('bank_account', kyc_record.bank_account_number, user_salt),
      bank_name = kyc_record.bank_name,
      bank_ifsc_code = kyc_record.bank_ifsc_code,
      address_line1 = kyc_record.address_line1,
      address_line2 = kyc_record.address_line2,
      city = kyc_record.city,
      state = kyc_record.state,
      pincode = kyc_record.pincode,
      country = kyc_record.country,
      verification_status = kyc_record.verification_status,
      pan_verified = kyc_record.pan_verified,
      aadhaar_verified = kyc_record.aadhaar_verified,
      bank_verified = kyc_record.bank_verified,
      created_at = kyc_record.created_at,
      updated_at = kyc_record.updated_at,
      cache_updated_at = now();
      
    -- Log the cache refresh for security audit
    INSERT INTO public.kyc_audit_log (user_id, action, details)
    VALUES (
      auth.uid(),
      'CACHE_REFRESH',
      jsonb_build_object(
        'timestamp', now(),
        'function', 'refresh_kyc_display_cache_enhanced',
        'masked_fields', jsonb_build_array('pan_number', 'aadhaar_number', 'bank_account_number')
      )
    );
  END IF;
END;
$function$;

-- 4. Create function to generate secure document URLs with expiration
CREATE OR REPLACE FUNCTION public.get_secure_document_url(
  bucket_name text,
  file_path text,
  expires_in integer DEFAULT 3600
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  signed_url text;
  user_folder text;
BEGIN
  -- Verify user owns the document (security check)
  user_folder := auth.uid()::text;
  
  IF NOT (file_path LIKE user_folder || '/%') THEN
    RAISE EXCEPTION 'Access denied: Document does not belong to user';
  END IF;
  
  -- Log document access attempt
  INSERT INTO public.kyc_audit_log (user_id, action, details)
  VALUES (
    auth.uid(),
    'DOCUMENT_ACCESS',
    jsonb_build_object(
      'timestamp', now(),
      'bucket', bucket_name,
      'file_path', file_path,
      'expires_in', expires_in
    )
  );
  
  -- This would normally generate a signed URL, but for now return a secure indicator
  -- In production, integrate with Supabase storage signed URLs
  RETURN 'secure_url_placeholder:' || file_path;
END;
$function$;

-- 5. Create document access logging table
CREATE TABLE IF NOT EXISTS public.document_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  bucket_name VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  access_type VARCHAR(20) NOT NULL DEFAULT 'VIEW', -- VIEW, DOWNLOAD, UPLOAD
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS on document access log
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- Policy for document access log
CREATE POLICY "Users can view own document access logs" 
ON public.document_access_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert document access logs" 
ON public.document_access_log 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL);

-- Prevent updates and deletes on access logs
CREATE POLICY "Prevent document access log modifications" 
ON public.document_access_log 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent document access log deletions" 
ON public.document_access_log 
FOR DELETE 
USING (false);