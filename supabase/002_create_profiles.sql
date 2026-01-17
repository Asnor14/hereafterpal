-- 1. CREATE THE `profiles` TABLE
-- This table will store public-facing data for users, like names.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT
);

-- 2. ENABLE ROW LEVEL SECURITY
-- This locks down the table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES FOR `profiles`
-- Users can see anyone's profile (for guestbook names, etc.)
CREATE POLICY "Allow public read access"
ON public.profiles
FOR SELECT USING (true);

-- Users can only update their *OWN* profile.
CREATE POLICY "Allow individual update access"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- 4. CREATE THE TRIGGER FUNCTION
-- This function will be called by the trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- 5. CREATE THE TRIGGER
-- This trigger fires AFTER a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

