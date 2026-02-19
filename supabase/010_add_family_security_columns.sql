-- Add security columns for role selection and family-shared keys
ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS creator_relationship TEXT,
ADD COLUMN IF NOT EXISTS family_password TEXT;

-- (Optional) If you haven't added the gender column yet, run this too:
-- ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'female';
