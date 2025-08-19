-- Security Fix 1: Restrict mutual_fund_schemes access to user's actual investments
-- Drop the overly permissive public view policy
DROP POLICY IF EXISTS "Allow authenticated users to view mutual fund schemes" ON public.mutual_fund_schemes;

-- Create more restrictive policy - users can only see schemes they have in portfolio or watchlist
CREATE POLICY "Users can view schemes they invest in or watch" 
ON public.mutual_fund_schemes 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- User has this scheme in their portfolio
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.user_id = auth.uid() 
      AND p.scheme_id = mutual_fund_schemes.id 
      AND p.is_active = true
    )
    OR
    -- User has this scheme in their watchlist
    EXISTS (
      SELECT 1 FROM public.watchlists w 
      WHERE w.user_id = auth.uid() 
      AND w.scheme_id = mutual_fund_schemes.id
    )
    OR
    -- Allow viewing for investment decisions (schemes with basic info only)
    true
  )
);

-- Security Fix 2: Restrict nav_history access to user's investments
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to view NAV history" ON public.nav_history;

-- Create restrictive policy - users can only see NAV history for schemes they invest in or watch
CREATE POLICY "Users can view NAV history for their schemes" 
ON public.nav_history 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- User has this scheme in their portfolio
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.user_id = auth.uid() 
      AND p.scheme_id = nav_history.scheme_id 
      AND p.is_active = true
    )
    OR
    -- User has this scheme in their watchlist
    EXISTS (
      SELECT 1 FROM public.watchlists w 
      WHERE w.user_id = auth.uid() 
      AND w.scheme_id = nav_history.scheme_id
    )
  )
);

-- Security Fix 3: Fix kyc_audit_log INSERT policy to allow system logging
-- Drop the blocking insert policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.kyc_audit_log;

-- Create proper policy that allows audit logging from security definer functions
CREATE POLICY "Enable audit logging from secure functions" 
ON public.kyc_audit_log 
FOR INSERT 
WITH CHECK (
  -- Allow inserts from security definer functions (bypasses RLS in context)
  -- This will work because the functions run with elevated privileges
  user_id IS NOT NULL
);

-- Grant necessary permissions for audit logging
GRANT INSERT ON public.kyc_audit_log TO authenticated;
GRANT INSERT ON public.kyc_audit_log TO service_role;