-- 1. ADD THE "role" COLUMN TO THE PROFILES TABLE
ALTER TABLE public.profiles
ADD COLUMN role TEXT;

-- 2. DROP THE OLD TRIGGER AND FUNCTION (so we can recreate them)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. CREATE A NEW, SMARTER FUNCTION
-- This new version uses COALESCE to get the name and avatar from
-- EITHER Google/OAuth (raw_user_meta_data)
-- OR our Email Sign-up Form (raw_app_meta_data).
-- It also adds the new 'role' field from our form.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      new.raw_app_meta_data->>'full_name'
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'role'
  );
  RETURN new;
END;
$$;

-- 4. RE-CREATE THE TRIGGER
-- This trigger fires AFTER a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

