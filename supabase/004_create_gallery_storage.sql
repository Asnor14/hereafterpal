-- 1. CREATE STORAGE BUCKET for memorial photos
-- We'll call it "memorial-photos" and make it public.
INSERT INTO storage.buckets (id, name, public)
VALUES ('memorial-photos', 'memorial-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE `gallery_photos` TABLE
CREATE TABLE public.gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  -- We also store the user_id for easier RLS policies
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. ENABLE RLS
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES for `gallery_photos`
-- Anyone can view photos
CREATE POLICY "Allow public read access"
ON public.gallery_photos
FOR SELECT USING (true);

-- Only the owner of the memorial can add photos
CREATE POLICY "Allow individual insert access"
ON public.gallery_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete
CREATE POLICY "Allow individual delete access"
ON public.gallery_photos
FOR DELETE
USING (auth.uid() = user_id);

-- 5. RLS POLICIES for storage bucket
-- Anyone can view
CREATE POLICY "Allow public read access on memorial-photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'memorial-photos');

-- Only the logged-in user can upload
CREATE POLICY "Allow authenticated uploads on memorial-photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'memorial-photos' AND auth.role() = 'authenticated');

