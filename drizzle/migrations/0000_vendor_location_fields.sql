ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS place_id text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS vendors_place_id_key ON public.vendors (place_id) WHERE place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS vendors_city_idx ON public.vendors (city);