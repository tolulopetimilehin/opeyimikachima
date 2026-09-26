CREATE TABLE public.wedding_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL CHECK (char_length(guest_name) BETWEEN 2 AND 120),
  email text,
  response text NOT NULL CHECK (response IN ('yes', 'maybe', 'no')),
  access_code text NOT NULL UNIQUE CHECK (access_code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.wedding_rsvps TO service_role;
ALTER TABLE public.wedding_rsvps ENABLE ROW LEVEL SECURITY;
CREATE INDEX wedding_rsvps_created_at_idx ON public.wedding_rsvps (created_at DESC);