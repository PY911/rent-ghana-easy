CREATE OR REPLACE FUNCTION public.request_booking(
  p_listing_id uuid,
  p_start_date date,
  p_end_date date,
  p_quantity integer,
  p_contact_name text,
  p_contact_phone text,
  p_delivery_address text,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(id uuid, reference text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  SELECT * INTO v_listing
  FROM public.listings l
  WHERE l.id = p_listing_id
    AND l.status = 'published'
    AND l.admin_approved = true;

  IF NOT FOUND OR v_listing.price <= 0 OR p_quantity > v_listing.quantity THEN
    RAISE EXCEPTION 'Listing unavailable';
  END IF;

  PERFORM public.assert_booking_capacity(p_listing_id, p_start_date, p_end_date, p_quantity, NULL);

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
    'YK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ) RETURNING b.id, b.reference;
END;
$$;

REVOKE ALL ON FUNCTION public.request_booking(uuid, date, date, integer, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_booking(uuid, date, date, integer, text, text, text, text) TO authenticated;