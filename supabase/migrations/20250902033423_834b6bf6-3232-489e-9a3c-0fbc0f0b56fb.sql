-- Drop dependent policies first
DROP POLICY IF EXISTS "Users can view schemes they invest in or watch" ON public.mutual_fund_schemes;
DROP POLICY IF EXISTS "Users can view NAV history for their schemes" ON public.nav_history;

-- Recreate the mutual_fund_schemes policy without watchlist dependency
CREATE POLICY "Users can view all active schemes" 
  ON public.mutual_fund_schemes 
  FOR SELECT 
  USING (is_active = true);

-- Recreate the NAV history policy without watchlist dependency
CREATE POLICY "Users can view NAV history for all active schemes" 
  ON public.nav_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.mutual_fund_schemes 
      WHERE id = nav_history.scheme_id AND is_active = true
    )
  );

-- Now safely drop the scheme_id column from watchlists
ALTER TABLE public.watchlists 
DROP COLUMN IF EXISTS scheme_id CASCADE;

-- Add the new scheme_codes array column
ALTER TABLE public.watchlists 
ADD COLUMN IF NOT EXISTS scheme_codes TEXT[] DEFAULT '{}';

-- Add missing onboarding_status column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'NEEDS_KYC';

-- Add risk_profile column for risk assessment
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS risk_profile TEXT;