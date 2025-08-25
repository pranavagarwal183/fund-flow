-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Use a transaction to ensure atomicity
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      email,
      created_at,
      kyc_status,
      risk_profile_status,
      account_status
    )
    VALUES (
      new.id,
      new.email,
      new.created_at,
      'pending',
      'pending',
      'active'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the signup
      RAISE WARNING 'Failed to create user profile for user %: %', new.id, SQLERRM;
      RETURN new;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
