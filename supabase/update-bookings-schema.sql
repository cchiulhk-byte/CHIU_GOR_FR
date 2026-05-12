-- 1. Add new columns to the bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS edit_request JSONB DEFAULT null;

-- 2. Update RLS Policies for Students
-- Allow students to see their own bookings
DROP POLICY IF EXISTS "Allow users to see their own bookings" ON public.bookings;
CREATE POLICY "Allow users to see their own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Allow students to update their own bookings (subject to status check)
DROP POLICY IF EXISTS "Allow users to update their own bookings" ON public.bookings;
CREATE POLICY "Allow users to update their own bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Update existing policies to handle the new columns
-- Ensure service role still has full access
DROP POLICY IF EXISTS "Service role full access" ON public.bookings;
CREATE POLICY "Service role full access" ON public.bookings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
