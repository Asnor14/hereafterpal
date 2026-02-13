-- 1. Create TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_method TEXT, -- 'gcash', 'maya', 'bank_transfer'
  reference_no TEXT UNIQUE,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins (service role or specific email) can view all
-- Note: 'service_role' bypasses RLS automatically, but if we access via client with admin check:
CREATE POLICY "Admins can view all transactions" 
ON public.transactions FOR SELECT 
USING (auth.jwt() ->> 'email' = 'asnor023@gmail.com');

-- 2. Update SUBSCRIPTIONS Table
-- Remove PayMongo dependency
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS paymongo_subscription_id;

-- Add new columns for manual/internal subscription management
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;

-- Ensure status column exists (already created in 008 but ensuring)
-- ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS status TEXT;

-- Update RLS for Subscriptions to allow Admin view
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.jwt() ->> 'email' = 'asnor023@gmail.com');

-- 3. Create Storage Bucket for Payment Proofs (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload proofs
CREATE POLICY "Users can upload payment proofs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid() = owner);

-- Policy: Admins can view proofs
CREATE POLICY "Admins can view payment proofs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-proofs' AND (auth.jwt() ->> 'email' = 'asnor023@gmail.com' OR auth.uid() = owner));
