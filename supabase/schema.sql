-- ============================================================
-- Clinicals Mini - Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Create the stage enum
CREATE TYPE enquiry_stage AS ENUM (
  'new',
  'contacted',
  'conference_call',
  'clinic_visit',
  'converted',
  'dropped'
);

-- Create the enquiries table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  city        TEXT NOT NULL,
  stage       enquiry_stage NOT NULL DEFAULT 'new',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (submit enquiry form) — no auth required
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated team members can SELECT, UPDATE (manage leads)
CREATE POLICY "Team can read enquiries"
  ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team can update enquiries"
  ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX enquiries_created_at_idx ON public.enquiries (created_at DESC);
CREATE INDEX enquiries_stage_idx ON public.enquiries (stage);
