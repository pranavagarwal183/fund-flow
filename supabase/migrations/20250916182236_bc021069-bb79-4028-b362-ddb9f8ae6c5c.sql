-- COMPREHENSIVE SECURITY FIX FOR USER_PROFILES TABLE
-- This migration addresses potential security vulnerabilities and implements defense-in-depth

-- 1. Create audit logging for user_profiles access
CREATE TABLE IF NOT EXISTS public.user_profile_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  accessed_by UUID,
  action VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  details JSONB
);

-- Enable RLS on audit log
ALTER TABLE public.user_profile_audit_log ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check user access
CREATE OR REPLACE FUNCTION public.verify_profile_access(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Log access attempt
  INSERT INTO public.user_profile_audit_log (
    user_id, 
    accessed_by, 
    action,
    ip_address,
    details
  ) VALUES (
    target_user_id,
    current_user_id,
    'ACCESS_CHECK',
    NULL, -- IP will be logged elsewhere
    jsonb_build_object(
      'timestamp', now(),
      'function', 'verify_profile_access',
      'requested_user', target_user_id,
      'authenticated_user', current_user_id
    )
  );
  
  -- Only allow access to own profile
  RETURN current_user_id = target_user_id;
END;
$$;

-- 3. Create function to mask sensitive profile data for display
CREATE OR REPLACE FUNCTION public.get_masked_profile(profile_user_id UUID)
RETURNS TABLE(
  id UUID,
  email VARCHAR,
  full_name VARCHAR,
  phone_masked VARCHAR,
  date_of_birth_masked VARCHAR,
  account_status VARCHAR,
  kyc_status VARCHAR,
  risk_category VARCHAR,
  onboarding_status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user can access this profile
  IF NOT public.verify_profile_access(profile_user_id) THEN
    RAISE EXCEPTION 'Access denied to user profile';
  END IF;
  
  -- Return masked profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    CASE 
      WHEN p.phone IS NOT NULL AND length(p.phone) > 4 THEN
        '****' || substring(p.phone from length(p.phone) - 3)
      ELSE '****'
    END as phone_masked,
    CASE 
      WHEN p.date_of_birth IS NOT NULL THEN
        extract(year from p.date_of_birth)::text || '-**-**'
      ELSE NULL
    END as date_of_birth_masked,
    p.account_status,
    p.kyc_status,
    p.risk_category,
    p.onboarding_status,
    p.created_at,
    p.updated_at
  FROM public.user_profiles p
  WHERE p.id = profile_user_id;
END;
$$;

-- 4. Update RLS policies with enhanced security
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- New enhanced RLS policies
CREATE POLICY "Enhanced users can view own profile ONLY"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  AND auth.uid() IS NOT NULL
  AND public.verify_profile_access(id)
);

CREATE POLICY "Enhanced users can update own profile ONLY"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() 
  AND auth.uid() IS NOT NULL
  AND public.verify_profile_access(id)
)
WITH CHECK (
  id = auth.uid()
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Enhanced users can insert own profile ONLY"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  AND auth.uid() IS NOT NULL
);

-- 5. Create RLS policies for audit log
CREATE POLICY "Users can view own profile audit logs"
ON public.user_profile_audit_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR accessed_by = auth.uid());

CREATE POLICY "System can insert audit logs"
ON public.user_profile_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Prevent modification of audit logs
CREATE POLICY "Prevent audit log modifications"
ON public.user_profile_audit_log
FOR UPDATE
USING (false);

CREATE POLICY "Prevent audit log deletions"
ON public.user_profile_audit_log
FOR DELETE
USING (false);

-- 6. Create trigger to log profile access attempts
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log SELECT operations
  IF TG_OP = 'SELECT' THEN
    -- This would be called on SELECT but triggers don't fire on SELECT
    -- We handle this in the RLS policy instead
    RETURN NULL;
  END IF;
  
  -- Log INSERT/UPDATE operations
  INSERT INTO public.user_profile_audit_log (
    user_id,
    accessed_by,
    action,
    details
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'timestamp', now(),
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'changed_fields', CASE 
        WHEN TG_OP = 'UPDATE' THEN
          jsonb_build_object(
            'old_email', OLD.email,
            'new_email', NEW.email,
            'old_phone', CASE WHEN OLD.phone IS DISTINCT FROM NEW.phone THEN 'changed' ELSE 'unchanged' END,
            'old_kyc_status', OLD.kyc_status,
            'new_kyc_status', NEW.kyc_status
          )
        ELSE jsonb_build_object('new_profile', 'created')
      END
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS user_profile_audit_trigger ON public.user_profiles;
CREATE TRIGGER user_profile_audit_trigger
  AFTER INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_access();

-- 7. Create function for secure profile updates (to be used by edge functions)
CREATE OR REPLACE FUNCTION public.secure_update_profile(
  profile_user_id UUID,
  update_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_fields TEXT[] := ARRAY['kyc_status', 'kyc_completed_at', 'risk_profile', 'risk_category', 'account_status', 'updated_at'];
  field_key TEXT;
  update_query TEXT;
  field_count INTEGER := 0;
BEGIN
  -- Validate that only allowed fields are being updated
  FOR field_key IN SELECT jsonb_object_keys(update_data)
  LOOP
    IF NOT (field_key = ANY(allowed_fields)) THEN
      RAISE EXCEPTION 'Unauthorized field update attempt: %', field_key;
    END IF;
    field_count := field_count + 1;
  END LOOP;
  
  -- Limit number of fields that can be updated at once
  IF field_count > 5 THEN
    RAISE EXCEPTION 'Too many fields in single update operation';
  END IF;
  
  -- Log the secure update
  INSERT INTO public.user_profile_audit_log (
    user_id,
    accessed_by,
    action,
    details
  ) VALUES (
    profile_user_id,
    NULL, -- System operation
    'SECURE_UPDATE',
    jsonb_build_object(
      'timestamp', now(),
      'function', 'secure_update_profile',
      'fields_updated', update_data,
      'field_count', field_count
    )
  );
  
  -- Perform the update with field validation
  UPDATE public.user_profiles 
  SET 
    kyc_status = CASE WHEN update_data ? 'kyc_status' THEN update_data->>'kyc_status' ELSE kyc_status END,
    kyc_completed_at = CASE 
      WHEN update_data ? 'kyc_completed_at' THEN 
        (update_data->>'kyc_completed_at')::timestamp 
      ELSE kyc_completed_at 
    END,
    risk_profile = CASE WHEN update_data ? 'risk_profile' THEN update_data->>'risk_profile' ELSE risk_profile END,
    risk_category = CASE WHEN update_data ? 'risk_category' THEN update_data->>'risk_category' ELSE risk_category END,
    account_status = CASE WHEN update_data ? 'account_status' THEN update_data->>'account_status' ELSE account_status END,
    updated_at = now()
  WHERE id = profile_user_id;
  
  RETURN FOUND;
END;
$$;

-- 8. Add additional constraints for data integrity
ALTER TABLE public.user_profiles 
ADD CONSTRAINT valid_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.user_profiles 
ADD CONSTRAINT valid_kyc_status CHECK (kyc_status IN ('pending', 'submitted', 'under_review', 'completed', 'rejected'));

ALTER TABLE public.user_profiles 
ADD CONSTRAINT valid_account_status CHECK (account_status IN ('active', 'suspended', 'closed', 'pending'));

-- 9. Create index for better performance and security monitoring
CREATE INDEX IF NOT EXISTS idx_user_profiles_security ON public.user_profiles(id, email, kyc_status, account_status);
CREATE INDEX IF NOT EXISTS idx_profile_audit_user_time ON public.user_profile_audit_log(user_id, accessed_at);
CREATE INDEX IF NOT EXISTS idx_profile_audit_action ON public.user_profile_audit_log(action, accessed_at);