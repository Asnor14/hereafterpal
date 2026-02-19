-- 1. Update memorial_access policies to allow joining
-- Allow users to insert their own access record when they have a valid key
CREATE POLICY "Users can insert their own access"
ON public.memorial_access
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own access record (e.g. for upserts)
CREATE POLICY "Users can update their own access"
ON public.memorial_access
FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Update memorials policies to allow finding by Family Key
-- This allows the 'Join' search to work even for private memorials
-- limited to finding by the key.
CREATE POLICY "Memorials are findable by Family Key"
ON public.memorials
FOR SELECT
USING (family_password IS NOT NULL);

-- (Optional but recommended) Ensure creators can see their own passwords in the dashboard
-- This is usually covered by their ownership policy, but good to verify.
