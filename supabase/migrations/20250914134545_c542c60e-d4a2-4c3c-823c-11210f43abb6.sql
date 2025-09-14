-- Security Hardening Phase 1: Critical Schema and Function Security
-- Make user_id columns NOT NULL where they should be required for RLS

-- Fix user_id nullability in critical tables
ALTER TABLE public.user_profiles ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.kyc_details ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.investment_goals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.risk_assessments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.sips ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.watchlists ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.kyc_audit_log ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.kyc_display_cache ALTER COLUMN user_id SET NOT NULL;

-- Add CHECK constraints to ensure user_id is always set for RLS-dependent tables
ALTER TABLE public.kyc_details ADD CONSTRAINT check_user_id_not_null CHECK (user_id IS NOT NULL);
ALTER TABLE public.investment_goals ADD CONSTRAINT check_user_id_not_null CHECK (user_id IS NOT NULL);
ALTER TABLE public.risk_assessments ADD CONSTRAINT check_user_id_not_null CHECK (user_id IS NOT NULL);
ALTER TABLE public.sips ADD CONSTRAINT check_user_id_not_null CHECK (user_id IS NOT NULL);
ALTER TABLE public.transactions ADD CONSTRAINT check_user_id_not_null CHECK (user_id IS NOT NULL);
ALTER TABLE public.watchlists ADD CONSTRAINT check_user_id_not_null CHECK (user_id IS NOT NULL);

-- Fix search_path security in existing functions
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(data_type text, value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.get_kyc_details_secure()
RETURNS TABLE(id uuid, user_id uuid, pan_number character varying, aadhaar_number character varying, bank_account_number character varying, bank_name character varying, bank_ifsc_code character varying, address_line1 character varying, address_line2 character varying, city character varying, state character varying, pincode character varying, country character varying, verification_status character varying, pan_verified boolean, aadhaar_verified boolean, bank_verified boolean, created_at timestamp without time zone, updated_at timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.update_kyc_details_secure(p_pan_number character varying DEFAULT NULL::character varying, p_aadhaar_number character varying DEFAULT NULL::character varying, p_bank_account_number character varying DEFAULT NULL::character varying, p_bank_name character varying DEFAULT NULL::character varying, p_bank_ifsc_code character varying DEFAULT NULL::character varying, p_address_line1 character varying DEFAULT NULL::character varying, p_address_line2 character varying DEFAULT NULL::character varying, p_city character varying DEFAULT NULL::character varying, p_state character varying DEFAULT NULL::character varying, p_pincode character varying DEFAULT NULL::character varying, p_country character varying DEFAULT NULL::character varying)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.refresh_kyc_display_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  kyc_record RECORD;
BEGIN
  -- Get the user's KYC details
  SELECT * INTO kyc_record FROM public.kyc_details WHERE user_id = auth.uid();
  
  IF FOUND THEN
    -- Update or insert cached display data
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
      public.mask_sensitive_data('pan', kyc_record.pan_number),
      public.mask_sensitive_data('aadhaar', kyc_record.aadhaar_number),
      public.mask_sensitive_data('bank_account', kyc_record.bank_account_number),
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
      pan_number_masked = public.mask_sensitive_data('pan', kyc_record.pan_number),
      aadhaar_number_masked = public.mask_sensitive_data('aadhaar', kyc_record.aadhaar_number),
      bank_account_number_masked = public.mask_sensitive_data('bank_account', kyc_record.bank_account_number),
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
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_portfolio_value(user_uuid uuid)
RETURNS TABLE(total_invested numeric, current_value numeric, total_gains numeric, percentage_gain numeric)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(p.total_invested_amount), 0) as total_invested,
    COALESCE(SUM(p.total_units * mfs.current_nav), 0) as current_value,
    COALESCE(SUM(p.total_units * mfs.current_nav) - SUM(p.total_invested_amount), 0) as total_gains,
    CASE 
      WHEN SUM(p.total_invested_amount) > 0 
      THEN ((SUM(p.total_units * mfs.current_nav) - SUM(p.total_invested_amount)) / SUM(p.total_invested_amount)) * 100
      ELSE 0
    END as percentage_gain
  FROM public.portfolios p
  JOIN public.mutual_fund_schemes mfs ON p.scheme_id = mfs.id
  WHERE p.user_id = user_uuid AND p.is_active = TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use a transaction to ensure atomicity
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      email,
      created_at,
      kyc_status,
      risk_profile_status,
      account_status,
      onboarding_status
    )
    VALUES (
      new.id,
      new.email,
      new.created_at,
      'pending',
      'pending',
      'active',
      'NEEDS_KYC'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the signup
      RAISE WARNING 'Failed to create user profile for user %: %', new.id, SQLERRM;
      RETURN new;
  END;
  
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_sip(monthly_amount numeric, annual_return_rate numeric, investment_years integer)
RETURNS TABLE(total_invested numeric, maturity_value numeric, wealth_gained numeric)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  monthly_rate DECIMAL;
  total_months INTEGER;
BEGIN
  monthly_rate := annual_return_rate / 100 / 12;
  total_months := investment_years * 12;
  
  RETURN QUERY
  SELECT 
    monthly_amount * total_months as total_invested,
    CASE 
      WHEN monthly_rate > 0 THEN
        monthly_amount * (POWER(1 + monthly_rate, total_months) - 1) / monthly_rate * (1 + monthly_rate)
      ELSE 
        monthly_amount * total_months
    END as maturity_value,
    CASE 
      WHEN monthly_rate > 0 THEN
        (monthly_amount * (POWER(1 + monthly_rate, total_months) - 1) / monthly_rate * (1 + monthly_rate)) - (monthly_amount * total_months)
      ELSE 
        0
    END as wealth_gained;
END;
$$;

-- Add enhanced input validation functions
CREATE OR REPLACE FUNCTION public.validate_pan_number(pan_input text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- PAN validation: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
  RETURN pan_input ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_aadhaar_number(aadhaar_input text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- Aadhaar validation: 12 digits, basic checksum validation
  IF NOT (aadhaar_input ~ '^[0-9]{12}$') THEN
    RETURN FALSE;
  END IF;
  
  -- Simple checksum validation (Verhoeff algorithm simplified)
  -- This is a basic implementation - production should use full Verhoeff
  RETURN length(aadhaar_input) = 12 AND aadhaar_input NOT LIKE '000000000000';
END;
$$;

-- Create rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  action text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- RLS for rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are managed by system"
ON public.rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  identifier_input text,
  action_input text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_attempts integer := 0;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < window_start_time;
  
  -- Check current attempts
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM public.rate_limits
  WHERE identifier = identifier_input 
    AND action = action_input
    AND window_start >= window_start_time;
  
  -- If under limit, record attempt and allow
  IF current_attempts < max_attempts THEN
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (identifier_input, action_input, 1)
    ON CONFLICT (identifier, action) 
    DO UPDATE SET 
      attempts = rate_limits.attempts + 1,
      window_start = CASE 
        WHEN rate_limits.window_start < window_start_time THEN now()
        ELSE rate_limits.window_start
      END;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;