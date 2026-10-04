-- Public catalogues remain readable, but private vendor contacts stay owner/admin-only.
CREATE OR REPLACE VIEW public.public_vendors WITH (security_invoker = true) AS
SELECT id, name, slug, city, about, logo_url, verified, rating, review_count, website, address, latitude, longitude, place_id, approved, created_at
FROM public.vendors WHERE approved = true;
GRANT SELECT ON public.public_vendors TO anon, authenticated;

-- A listing's public relation can use this safe projection instead of vendors(*).
CREATE OR REPLACE VIEW public.public_listings WITH (security_invoker = true) AS
SELECT id, vendor_id, category_id, title, slug, description, price, price_unit, min_days, city, quantity, images, featured, status, created_at
FROM public.listings WHERE status = 'published' AND admin_approved = true;
GRANT SELECT ON public.public_listings TO anon, authenticated;

-- Views above cannot read restricted source rows under invoker RLS; instead use
-- dedicated sanitized public tables exposed through a narrow definer function.
CREATE OR REPLACE FUNCTION public.get_public_vendors()
RETURNS TABLE (id uuid, name text, slug text, city text, about text, logo_url text, verified boolean, rating numeric, review_count integer, website text, address text, latitude double precision, longitude double precision, place_id text, approved boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.id, v.name, v.slug, v.city, v.about, v.logo_url, v.verified, v.rating, v.review_count, v.website, v.address, v.latitude, v.longitude, v.place_id, v.approved, v.created_at
  FROM public.vendors v WHERE v.approved = true
$$;
REVOKE ALL ON FUNCTION public.get_public_vendors() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_vendors() TO anon, authenticated;

DROP POLICY IF EXISTS vendors_public_read ON public.vendors;
CREATE POLICY vendors_owner_read ON public.vendors FOR SELECT TO authenticated USING (owner_id = auth.uid());
REVOKE SELECT ON public.vendors FROM anon;

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
REVOKE SELECT ON public.profiles FROM anon;

DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
CREATE POLICY site_settings_markup_read ON public.site_settings FOR SELECT TO anon, authenticated USING (key = 'default_markup_percent');

DROP POLICY IF EXISTS categories_public_read ON public.categories;
CREATE POLICY categories_nonempty_read ON public.categories FOR SELECT TO anon, authenticated USING (length(slug) > 0);

-- Only an owner may cancel a pending request; amounts and payment state cannot be set by a renter.
DROP POLICY IF EXISTS bookings_renter_insert ON public.bookings;
DROP POLICY IF EXISTS bookings_renter_update ON public.bookings;
REVOKE INSERT, UPDATE, DELETE ON public.bookings FROM authenticated;
GRANT SELECT ON public.bookings TO authenticated;
GRANT UPDATE (status) ON public.bookings TO authenticated;
CREATE POLICY bookings_renter_cancel ON public.bookings FOR UPDATE TO authenticated
  USING (renter_id = auth.uid() AND status = 'pending')
  WITH CHECK (renter_id = auth.uid() AND status = 'cancelled');

CREATE OR REPLACE FUNCTION public.request_booking(
  p_listing_id uuid, p_start_date date, p_end_date date, p_quantity integer,
  p_contact_name text, p_contact_phone text, p_delivery_address text, p_notes text DEFAULT NULL
)
RETURNS TABLE (id uuid, reference text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_listing public.listings%ROWTYPE;
  v_units integer;
  v_total numeric;
  v_vendor_total numeric;
  v_deposit numeric;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF p_start_date IS NULL OR p_start_date < current_date OR p_end_date IS NULL OR p_end_date < p_start_date OR p_end_date > p_start_date + 365 THEN RAISE EXCEPTION 'Invalid rental dates'; END IF;
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 1000 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  IF length(trim(coalesce(p_contact_name,''))) NOT BETWEEN 2 AND 150 OR length(trim(coalesce(p_contact_phone,''))) NOT BETWEEN 7 AND 30 OR length(trim(coalesce(p_delivery_address,''))) NOT BETWEEN 5 AND 300 OR length(coalesce(p_notes,'')) > 2000 THEN RAISE EXCEPTION 'Invalid contact details'; END IF;
  SELECT * INTO v_listing FROM public.listings l WHERE l.id = p_listing_id AND l.status = 'published' AND l.admin_approved = true;
  IF NOT FOUND OR v_listing.price <= 0 OR p_quantity > v_listing.quantity THEN RAISE EXCEPTION 'Listing unavailable'; END IF;
  v_units := CASE WHEN v_listing.price_unit = 'event' THEN 1 ELSE greatest(p_end_date - p_start_date + 1, v_listing.min_days) END;
  v_total := round(v_listing.price * v_units * p_quantity, 0);
  v_vendor_total := round(coalesce(v_listing.vendor_price, v_listing.price) * v_units * p_quantity, 0);
  v_deposit := round(v_total * 0.30, 0);
  RETURN QUERY INSERT INTO public.bookings AS b (
    listing_id, vendor_id, renter_id, start_date, end_date, quantity, total,
    vendor_total, platform_fee, deposit_amount, balance_amount, balance_due_date,
    contact_name, contact_phone, delivery_address, notes, status, payment_status, reference
  ) VALUES (
    v_listing.id, v_listing.vendor_id, v_user, p_start_date, p_end_date, p_quantity, v_total,
    v_vendor_total, greatest(0, v_total - v_vendor_total), v_deposit, v_total - v_deposit, p_start_date - 1,
    trim(p_contact_name), trim(p_contact_phone), trim(p_delivery_address), nullif(trim(p_notes), ''), 'pending', 'unpaid',
    'YW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ) RETURNING b.id, b.reference;
END;
$$;
REVOKE ALL ON FUNCTION public.request_booking(uuid, date, date, integer, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_booking(uuid, date, date, integer, text, text, text, text) TO authenticated;