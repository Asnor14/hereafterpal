-- 1. Create the memorial_access table
-- This table tracks secondary family members who join a memorial using a Family Key.
CREATE TABLE IF NOT EXISTS public.memorial_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('Mom', 'Dad')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(memorial_id, user_id) -- A user can only join a memorial once
);

-- 2. Enable RLS
ALTER TABLE public.memorial_access ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can view their own access records
CREATE POLICY "Users can view their own access"
ON public.memorial_access
FOR SELECT
USING (auth.uid() = user_id);

-- Primary owners can view all access records for their memorial
CREATE POLICY "Owners can view collaborator access"
ON public.memorial_access
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.memorials 
  WHERE public.memorials.id = memorial_id 
  AND public.memorials.user_id = auth.uid()
));

-- (Insert/Delete policies will be handled by the application logic checks)
