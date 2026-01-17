-- 1. CREATE THE TABLE
-- This creates the 'memorials' table where all data will be stored.
CREATE TABLE public.memorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  bio TEXT,
  service_type TEXT,
  image_url TEXT
);

-- 2. ENABLE ROW LEVEL SECURITY
-- This is the MASTER LOCK. By default, no one can see any data.
ALTER TABLE public.memorials ENABLE ROW LEVEL SECURITY;

-- 3. CREATE "SELECT" POLICY (Read)
-- Allows a user to READ a memorial *only if* it matches their own user_id.
CREATE POLICY "Allow individual read access"
ON public.memorials
FOR SELECT
USING (auth.uid() = user_id);

-- 4. CREATE "INSERT" POLICY (Create)
-- Allows a user to CREATE a memorial *only if* they set the user_id to their own.
CREATE POLICY "Allow individual insert access"
ON public.memorials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. CREATE "UPDATE" POLICY (Edit)
-- Allows a user to UPDATE a memorial *only if* it is their own.
CREATE POLICY "Allow individual update access"
ON public.memorials
FOR UPDATE
USING (auth.uid() = user_id);

-- 6. CREATE "DELETE" POLICY (Delete)
-- Allows a user to DELETE a memorial *only if* it is their own.
CREATE POLICY "Allow individual delete access"
ON public.memorials
FOR DELETE
USING (auth.uid() = user_id);

