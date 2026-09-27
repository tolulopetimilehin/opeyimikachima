ALTER TABLE public.wedding_rsvps DROP CONSTRAINT IF EXISTS wedding_rsvps_response_check;
ALTER TABLE public.wedding_rsvps ADD CONSTRAINT wedding_rsvps_response_check CHECK (response IN ('yes', 'no'));
COMMENT ON CONSTRAINT wedding_rsvps_response_check ON public.wedding_rsvps IS 'Guests choose yes or no; the maybe option was retired on 2026-09-26';