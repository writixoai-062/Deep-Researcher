-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> paste and run

CREATE TABLE IF NOT EXISTS public.waiting_list (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon key) to INSERT their own email
CREATE POLICY "Allow public inserts"
  ON public.waiting_list
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow the anon key to count rows (for the "first 20 users" discount logic)
CREATE POLICY "Allow public count"
  ON public.waiting_list
  FOR SELECT
  TO anon
  USING (true);
