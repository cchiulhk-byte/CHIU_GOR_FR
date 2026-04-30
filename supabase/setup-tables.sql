-- ============================================
-- Table: bookings
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  course_type TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  google_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for booking form submissions)
CREATE POLICY "Allow anonymous insert" ON public.bookings
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access" ON public.bookings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Table: availability_settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.availability_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{
    "enabledWeekdays": [0,1,2,3,4,5,6],
    "availableTimeSlotsByWeekday": {},
    "blockedDates": []
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read (for booking form to check available slots)
CREATE POLICY "Allow anonymous read" ON public.availability_settings
  FOR SELECT TO anon
  USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.availability_settings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default config
INSERT INTO public.availability_settings (id, config)
VALUES ('default', '{
  "enabledWeekdays": [0,1,2,3,4,5,6],
  "availableTimeSlotsByWeekday": {},
  "blockedDates": []
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Table: blog_posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read (public blog)
CREATE POLICY "Allow anonymous read" ON public.blog_posts
  FOR SELECT TO anon
  USING (true);

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access" ON public.blog_posts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Table: blog_likes
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read
CREATE POLICY "Allow anonymous read" ON public.blog_likes
  FOR SELECT TO anon
  USING (true);

-- Allow authenticated users to insert/delete their own likes
CREATE POLICY "Allow authenticated insert" ON public.blog_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete own" ON public.blog_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- Table: blog_comments
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read
CREATE POLICY "Allow anonymous read" ON public.blog_comments
  FOR SELECT TO anon
  USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Allow authenticated insert" ON public.blog_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update/delete their own comments
CREATE POLICY "Allow authenticated update own" ON public.blog_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete own" ON public.blog_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
