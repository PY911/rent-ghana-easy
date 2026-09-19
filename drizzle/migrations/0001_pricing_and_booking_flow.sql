-- Per-item pricing: vendor cost vs public price
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS vendor_price numeric,
  ADD COLUMN IF NOT EXISTS admin_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_notes text;

UPDATE public.listings SET admin_approved = true WHERE admin_approved = false;
UPDATE public.listings SET vendor_price = ROUND(price / 1.2) WHERE vendor_price IS NULL;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;

UPDATE public.vendors SET approved = true WHERE approved = false;

-- Booking money + payment lifecycle
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS vendor_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS balance_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_date date,
  ADD COLUMN IF NOT EXISTS balance_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS reference text;

UPDATE public.bookings SET reference = 'YW-' || upper(substr(replace(id::text, '-', ''), 1, 6)) WHERE reference IS NULL;

CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
CREATE INDEX IF NOT EXISTS listings_admin_approved_idx ON public.listings (admin_approved);

-- Public pages only show approved, published listings
DROP POLICY IF EXISTS listings_public_read ON public.listings;
CREATE POLICY listings_public_read ON public.listings
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND admin_approved = true);

-- Vendors only see bookings once the platform has confirmed them
DROP POLICY IF EXISTS bookings_vendor_read ON public.bookings;
CREATE POLICY bookings_vendor_read ON public.bookings
  FOR SELECT TO authenticated
  USING (
    status <> 'pending'
    AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = bookings.vendor_id AND v.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS bookings_vendor_update ON public.bookings;

-- Admin (site owner) has final say everywhere
CREATE POLICY bookings_admin_all ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY listings_admin_all ON public.listings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY vendors_admin_all ON public.vendors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY user_roles_admin_read ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Site-wide settings (default markup etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_settings_public_read ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY site_settings_admin_write ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value)
VALUES ('default_markup_percent', '20'::jsonb)
ON CONFLICT (key) DO NOTHING;