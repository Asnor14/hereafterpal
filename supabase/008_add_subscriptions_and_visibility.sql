---
--- 1. ADD "visibility" TO "memorials" TABLE
--- This controls if the public can see the page.
---
ALTER TABLE public.memorials
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';

-- Update the RLS policy for reading memorials
-- We will now allow ANYONE to read a memorial IF it is 'public'
-- We still allow the OWNER to read it if it's 'private'
DROP POLICY IF EXISTS "Allow individual read access" ON public.memorials;

CREATE POLICY "Allow public or owner read access"
ON public.memorials
FOR SELECT
USING (
  (visibility = 'public') OR (auth.uid() = user_id)
);

---
--- 2. CREATE "subscriptions" TABLE
--- This stores the user's payment plan status
---
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT, -- e.g., 'active', 'trialing', 'expired'
  expiry_date TIMESTAMPTZ,
  paymongo_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint on user_id to ensure one subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_unique ON public.subscriptions(user_id);

-- RLS for "subscriptions" table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their *OWN* subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- (Inserts and Updates will be handled by a secure API route / webhook)

