-- Run this SQL in Supabase SQL Editor if you prefer manual execution, 
-- or use the built-in setup API route in our application.

-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.convocation_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chalan_no TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    student_phone TEXT NOT NULL,
    student_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    department TEXT NOT NULL,
    amount INTEGER DEFAULT 6000 NOT NULL,
    payment_status TEXT DEFAULT 'pending_payment' NOT NULL, -- 'pending_payment', 'pending_approval', 'approved', 'rejected'
    transaction_id TEXT,
    screenshot_url TEXT,
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.convocation_registrations ENABLE ROW LEVEL SECURITY;

-- 3. Public read policy (Students checking their status by roll number / chalan)
DROP POLICY IF EXISTS "Public can view registration by chalan or roll_number" ON public.convocation_registrations;
CREATE POLICY "Public can view registration by chalan or roll_number"
ON public.convocation_registrations FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Public insert policy (Students submitting registration)
DROP POLICY IF EXISTS "Public can insert registration" ON public.convocation_registrations;
CREATE POLICY "Public can insert registration"
ON public.convocation_registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Public update policy (Students uploading proof or updating transaction id)
DROP POLICY IF EXISTS "Public can update transaction details" ON public.convocation_registrations;
CREATE POLICY "Public can update transaction details"
ON public.convocation_registrations FOR UPDATE
TO anon, authenticated
USING (true);

-- 6. Storage Bucket for Payment Screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "Public can upload screenshots" ON storage.objects;
CREATE POLICY "Public can upload screenshots"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public can view screenshots" ON storage.objects;
CREATE POLICY "Public can view screenshots"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-proofs');
