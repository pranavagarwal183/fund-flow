-- Security enhancements for kyc_details table

-- 1. Create audit log table for KYC access tracking
CREATE TABLE IF NOT EXISTS public.kyc_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL DEFAULT 'kyc_details',
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  details JSONB
);

-- Enable RLS on audit log
ALTER TABLE public.kyc_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert audit logs, users can view their own
CREATE POLICY "System can insert audit logs" ON public.kyc_audit_log
FOR INSERT WITH CHECK (false); -- Only system functions can insert

CREATE POLICY "Users can view own audit logs" ON public.kyc_audit_log
FOR SELECT USING (auth.uid() = user_id);

-- 2. Create secure functions for KYC data access with audit logging
CREATE OR REPLACE FUNCTION public.get_kyc_details_secure()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  pan_number VARCHAR,
  aadhaar_number VARCHAR,
  bank_account_number VARCHAR,
  bank_name VARCHAR,
  bank_ifsc_code VARCHAR,
  address_line1 VARCHAR,
  address_line2 VARCHAR,
  city VARCHAR,
  state VARCHAR,
  pincode VARCHAR,
  country VARCHAR,
  verification_status VARCHAR,
  pan_verified BOOLEAN,
  aadhaar_verified BOOLEAN,
  bank_verified BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the access attempt
  INSERT INTO public.kyc_audit_log (user_id, action, details)
  VALUES (
    auth.uid(),
    'SELECT',
    jsonb_build_object(
      'timestamp', now(),
      'function', 'get_kyc_details_secure'
    )
  );

  -- Return user's own KYC data only
  RETURN QUERY
  SELECT 
    k.id,
    k.user_id,
    k.pan_number,
    k.aadhaar_number,
    k.bank_account_number,
    k.bank_name,
    k.bank_ifsc_code,
    k.address_line1,
    k.address_line2,
    k.city,
    k.state,
    k.pincode,
    k.country,
    k.verification_status,
    k.pan_verified,
    k.aadhaar_verified,
    k.bank_verified,
    k.created_at,
    k.updated_at
  FROM public.kyc_details k
  WHERE k.user_id = auth.uid();
END;
$$;

-- 3. Create function to update KYC details with audit logging
CREATE OR REPLACE FUNCTION public.update_kyc_details_secure(
  p_pan_number VARCHAR DEFAULT NULL,
  p_aadhaar_number VARCHAR DEFAULT NULL,
  p_bank_account_number VARCHAR DEFAULT NULL,
  p_bank_name VARCHAR DEFAULT NULL,
  p_bank_ifsc_code VARCHAR DEFAULT NULL,
  p_address_line1 VARCHAR DEFAULT NULL,
  p_address_line2 VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_state VARCHAR DEFAULT NULL,
  p_pincode VARCHAR DEFAULT NULL,
  p_country VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  kyc_id UUID;
  changes JSONB := '{}';
BEGIN
  -- Build changes object for audit
  IF p_pan_number IS NOT NULL THEN
    changes := changes || jsonb_build_object('pan_number', 'updated');
  END IF;
  IF p_aadhaar_number IS NOT NULL THEN
    changes := changes || jsonb_build_object('aadhaar_number', 'updated');
  END IF;
  IF p_bank_account_number IS NOT NULL THEN
    changes := changes || jsonb_build_object('bank_account_number', 'updated');
  END IF;

  -- Insert or update KYC details
  INSERT INTO public.kyc_details (
    user_id,
    pan_number,
    aadhaar_number,
    bank_account_number,
    bank_name,
    bank_ifsc_code,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    country,
    updated_at
  ) VALUES (
    auth.uid(),
    p_pan_number,
    p_aadhaar_number,
    p_bank_account_number,
    p_bank_name,
    p_bank_ifsc_code,
    p_address_line1,
    p_address_line2,
    p_city,
    p_state,
    p_pincode,
    COALESCE(p_country, 'India')
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    pan_number = COALESCE(EXCLUDED.pan_number, kyc_details.pan_number),
    aadhaar_number = COALESCE(EXCLUDED.aadhaar_number, kyc_details.aadhaar_number),
    bank_account_number = COALESCE(EXCLUDED.bank_account_number, kyc_details.bank_account_number),
    bank_name = COALESCE(EXCLUDED.bank_name, kyc_details.bank_name),
    bank_ifsc_code = COALESCE(EXCLUDED.bank_ifsc_code, kyc_details.bank_ifsc_code),
    address_line1 = COALESCE(EXCLUDED.address_line1, kyc_details.address_line1),
    address_line2 = COALESCE(EXCLUDED.address_line2, kyc_details.address_line2),
    city = COALESCE(EXCLUDED.city, kyc_details.city),
    state = COALESCE(EXCLUDED.state, kyc_details.state),
    pincode = COALESCE(EXCLUDED.pincode, kyc_details.pincode),
    country = COALESCE(EXCLUDED.country, kyc_details.country),
    updated_at = now()
  RETURNING id INTO kyc_id;

  -- Log the update
  INSERT INTO public.kyc_audit_log (user_id, action, details)
  VALUES (
    auth.uid(),
    'UPDATE',
    jsonb_build_object(
      'timestamp', now(),
      'function', 'update_kyc_details_secure',
      'changes', changes,
      'kyc_id', kyc_id
    )
  );

  RETURN kyc_id;
END;
$$;

-- 4. Create stricter RLS policies for kyc_details (disable direct table access)
DROP POLICY IF EXISTS "Users can view own KYC details" ON public.kyc_details;
DROP POLICY IF EXISTS "Users can insert own KYC details" ON public.kyc_details;
DROP POLICY IF EXISTS "Users can update own KYC details" ON public.kyc_details;

-- Disable direct access - force use of secure functions
CREATE POLICY "Block direct KYC access" ON public.kyc_details
FOR ALL USING (false);

-- 5. Create secure storage policies for KYC documents
-- Update existing bucket policies to be more restrictive
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents-secure', 'kyc-documents-secure', false)
ON CONFLICT (id) DO NOTHING;

-- Secure KYC document access policies
DROP POLICY IF EXISTS "Users can upload KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own KYC documents" ON storage.objects;

CREATE POLICY "Secure KYC document upload" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'kyc-documents-secure' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND array_length(string_to_array(name, '/'), 1) = 2  -- Only allow one level deep
);

CREATE POLICY "Secure KYC document access" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'kyc-documents-secure' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Add data masking function for sensitive display
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data_type TEXT,
  value TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE data_type
    WHEN 'pan' THEN
      RETURN CASE 
        WHEN length(value) >= 10 THEN 
          substring(value, 1, 3) || '***' || substring(value, 7, 4)
        ELSE '***'
      END;
    WHEN 'aadhaar' THEN
      RETURN CASE 
        WHEN length(value) >= 12 THEN 
          '****' || substring(value, 5, 4) || '****'
        ELSE '***'
      END;
    WHEN 'bank_account' THEN
      RETURN CASE 
        WHEN length(value) >= 8 THEN 
          '****' || substring(value, -4)
        ELSE '***'
      END;
    ELSE
      RETURN '***';
  END CASE;
END;
$$;

-- 7. Create view for masked KYC display
CREATE OR REPLACE VIEW public.kyc_details_masked AS
SELECT 
  id,
  user_id,
  mask_sensitive_data('pan', pan_number) as pan_number_masked,
  mask_sensitive_data('aadhaar', aadhaar_number) as aadhaar_number_masked,
  mask_sensitive_data('bank_account', bank_account_number) as bank_account_number_masked,
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
  updated_at
FROM public.kyc_details
WHERE user_id = auth.uid();

-- Enable RLS on the view
ALTER VIEW public.kyc_details_masked SET (security_barrier = true);

-- Grant usage to authenticated users
GRANT SELECT ON public.kyc_details_masked TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_kyc_details_secure() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_kyc_details_secure(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mask_sensitive_data(TEXT, TEXT) TO authenticated;