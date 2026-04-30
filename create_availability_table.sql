-- Create availability_settings table for storing availability configuration
CREATE TABLE IF NOT EXISTS public.availability_settings (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_availability_settings_id ON public.availability_settings(id);

-- Enable Row Level Security for availability settings
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage availability settings
DROP POLICY IF EXISTS "availability_settings_service_role" ON public.availability_settings;
CREATE POLICY "availability_settings_service_role" ON public.availability_settings
  FOR ALL USING (auth.role() = 'service_role');
