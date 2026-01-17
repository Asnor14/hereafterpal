-- 1. CREATE `guestbook_entries` TABLE
CREATE TABLE public.guestbook_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- link to profile if logged in
  author_name TEXT, -- Fallback name for guests
  message TEXT NOT NULL
);

-- 2. ENABLE RLS
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES for `guestbook_entries`
-- Anyone can read guestbook entries
CREATE POLICY "Allow public read access"
ON public.guestbook_entries
FOR SELECT USING (true);

-- Any *logged-in* user can write an entry
CREATE POLICY "Allow authenticated users to insert"
ON public.guestbook_entries
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only the *owner of the memorial* can delete (moderate) entries
CREATE POLICY "Allow memorial owner to delete"
ON public.guestbook_entries
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.memorials m
    WHERE m.id = guestbook_entries.memorial_id AND m.user_id = auth.uid()
  )
);

