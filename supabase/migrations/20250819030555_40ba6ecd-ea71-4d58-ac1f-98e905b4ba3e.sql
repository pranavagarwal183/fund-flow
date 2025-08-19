-- Fix security linter issues from previous migration

-- 1. Fix the security definer view by removing it and creating proper RLS policies instead
DROP VIEW IF EXISTS public.kyc_details_masked;

-- 2. Fix search path issues for existing functions by updating them
CREATE OR REPLACE FUNCTION public.calculate_portfolio_value(user_uuid uuid)
RETURNS TABLE(total_invested numeric, current_value numeric, total_gains numeric, percentage_gain numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.calculate_sip(monthly_amount numeric, annual_return_rate numeric, investment_years integer)
RETURNS TABLE(total_invested numeric, maturity_value numeric, wealth_gained numeric)
LANGUAGE plpgsql
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    created_at,
    kyc_status,
    risk_profile_status
  )
  VALUES (
    new.id,
    new.email,
    new.created_at,
    'pending',
    'pending'
  );
  RETURN new;
END;
$function$;

-- 3. Create a regular table for masked KYC display instead of a security definer view
CREATE TABLE IF NOT EXISTS public.kyc_display_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  pan_number_masked VARCHAR,
  aadhaar_number_masked VARCHAR,
  bank_account_number_masked VARCHAR,
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
  updated_at TIMESTAMP,
  cache_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the cache table
ALTER TABLE public.kyc_display_cache ENABLE ROW LEVEL SECURITY;

-- RLS policy for cache table
CREATE POLICY "Users can view own cached KYC display" ON public.kyc_display_cache
FOR SELECT USING (auth.uid() = user_id);

-- Function to refresh KYC display cache
CREATE OR REPLACE FUNCTION public.refresh_kyc_display_cache()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Grant permissions
GRANT SELECT ON public.kyc_display_cache TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_kyc_display_cache() TO authenticated;