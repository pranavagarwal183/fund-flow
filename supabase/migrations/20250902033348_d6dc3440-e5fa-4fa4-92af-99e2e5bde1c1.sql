-- Add missing onboarding_status column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'NEEDS_KYC';

-- Add risk_profile column for risk assessment
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS risk_profile TEXT;

-- Create user_investments table for actual portfolio data
CREATE TABLE IF NOT EXISTS public.user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) NOT NULL,
  investment_type VARCHAR(20) NOT NULL DEFAULT 'SIP', -- 'SIP' or 'LUMPSUM'
  units_held DECIMAL(15,4) NOT NULL DEFAULT 0,
  average_nav DECIMAL(10,4) NOT NULL DEFAULT 0,
  total_invested DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  unrealized_gains DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_investments
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_investments
CREATE POLICY "Users can view own investments" 
  ON public.user_investments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" 
  ON public.user_investments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" 
  ON public.user_investments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Update watchlists table to use scheme_codes array instead of single scheme_id
ALTER TABLE public.watchlists 
DROP COLUMN IF EXISTS scheme_id;

ALTER TABLE public.watchlists 
ADD COLUMN IF NOT EXISTS scheme_codes TEXT[] DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON public.user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_scheme_id ON public.user_investments(scheme_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);

-- Update the trigger function to set correct initial onboarding status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;