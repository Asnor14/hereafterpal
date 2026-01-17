-- 1. CREATE A NEW STORAGE BUCKET
-- We'll call it "avatars" and make it public for easy image viewing.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE RLS POLICIES FOR `avatars`
-- Allow anyone to view public avatars
CREATE POLICY "Allow public read access on avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow a user to upload an avatar *only if* it's for their own profile.
-- We'll name the file based on their user ID.
CREATE POLICY "Allow individual avatar uploads"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.filename(name))
);

