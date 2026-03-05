-- Allow flexible custom roles in memorial_access instead of restricting to Mom/Dad.

ALTER TABLE public.memorial_access
  DROP CONSTRAINT IF EXISTS memorial_access_role_check;

ALTER TABLE public.memorial_access
  ADD CONSTRAINT memorial_access_role_check
  CHECK (role IS NULL OR length(trim(role)) > 0);
