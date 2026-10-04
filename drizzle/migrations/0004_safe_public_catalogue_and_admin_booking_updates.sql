-- A definer-owned view projects only non-sensitive fields and enforces published/approved filters.
CREATE OR REPLACE VIEW public.public_vendors AS
SELECT id, name, slug, city, about, logo_url, verified, rating, review_count, website, address, latitude, longitude, place_id, approved, created_at
FROM public.vendors WHERE approved = true;
CREATE OR REPLACE VIEW public.public_listings AS
SELECT id, vendor_id, category_id, title, slug, description, price, price_unit, min_days, city, quantity, images, featured, status, created_at
FROM public.listings WHERE status = 'published' AND admin_approved = true;
REVOKE ALL ON public.public_vendors FROM PUBLIC;
REVOKE ALL ON public.public_listings FROM PUBLIC;
GRANT SELECT ON public.public_vendors, public.public_listings TO anon, authenticated;
-- Admin needs all booking fields editable; non-admins retain only status UPDATE and a pending-to-cancelled policy.
GRANT UPDATE ON public.bookings TO authenticated;
CREATE OR REPLACE FUNCTION public.enforce_booking_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF auth.uid() IS NULL OR OLD.renter_id IS DISTINCT FROM auth.uid() OR OLD.status <> 'pending' OR NEW.status <> 'cancelled' OR (to_jsonb(NEW) - 'status') IS DISTINCT FROM (to_jsonb(OLD) - 'status') THEN
    RAISE EXCEPTION 'Only a pending booking may be cancelled';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_booking_update_before BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_update();