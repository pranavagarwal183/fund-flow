-- Add onboarding_status field to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN onboarding_status text DEFAULT 'PENDING' CHECK (onboarding_status IN ('PENDING', 'KYC_APPROVED', 'COMPLETE'));

-- Add index for better query performance
CREATE INDEX idx_user_profiles_onboarding_status ON public.user_profiles(onboarding_status);

-- Update existing users to have PENDING status if not set
UPDATE public.user_profiles 
SET onboarding_status = 'PENDING' 
WHERE onboarding_status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.onboarding_status IS 'Tracks user onboarding progress: PENDING, KYC_APPROVED, COMPLETE';
