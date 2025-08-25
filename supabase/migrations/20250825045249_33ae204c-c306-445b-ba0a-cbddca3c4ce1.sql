-- Fix the user profile trigger to set proper initial onboarding status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    phone,
    date_of_birth,
    gender,
    created_at,
    onboarding_status
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    CASE 
      WHEN new.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'date_of_birth')::date 
      ELSE NULL 
    END,
    COALESCE(new.raw_user_meta_data ->> 'gender', ''),
    new.created_at,
    'NEEDS_KYC'  -- Set initial onboarding status to start KYC process
  );
  RETURN new;
END;
$$;