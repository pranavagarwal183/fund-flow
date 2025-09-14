-- Fix KYC security issue: Replace blocking policy with user-specific access controls
-- This allows users to manage their own KYC data while maintaining security

-- Drop the overly restrictive policy that blocks all access
DROP POLICY IF EXISTS "Block direct KYC access" ON public.kyc_details;

-- Create proper user-specific RLS policies for KYC access
CREATE POLICY "Users can view own KYC details" 
  ON public.kyc_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC details" 
  ON public.kyc_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC details" 
  ON public.kyc_details 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users should not be able to delete KYC records for audit trail purposes
CREATE POLICY "Prevent KYC deletion" 
  ON public.kyc_details 
  FOR DELETE 
  USING (false);

-- Create audit trigger for direct KYC access to maintain security logging
CREATE OR REPLACE FUNCTION public.log_kyc_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the access for audit purposes
  INSERT INTO public.kyc_audit_log (user_id, action, details)
  VALUES (
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'timestamp', now(),
      'table', 'kyc_details',
      'direct_access', true,
      'kyc_id', COALESCE(NEW.id, OLD.id)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add the audit trigger to kyc_details table
CREATE TRIGGER kyc_access_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.kyc_details
  FOR EACH ROW EXECUTE FUNCTION public.log_kyc_access();

-- Ensure the kyc_details table has updated_at trigger
CREATE TRIGGER update_kyc_details_updated_at
  BEFORE UPDATE ON public.kyc_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();