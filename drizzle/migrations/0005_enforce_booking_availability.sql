CREATE OR REPLACE FUNCTION public.get_unavailable_listing_dates(p_listing_id uuid)
RETURNS TABLE(unavailable_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH listing_capacity AS (
    SELECT l.id, l.quantity
    FROM public.listings l
    WHERE l.id = p_listing_id
      AND l.status = 'published'
      AND l.admin_approved = true
  ), reserved_by_date AS (
    SELECT day::date AS reserved_date, sum(b.quantity)::integer AS reserved_quantity
    FROM public.bookings b
    CROSS JOIN LATERAL generate_series(
      greatest(b.start_date, current_date),
      least(b.end_date, current_date + 365),
      interval '1 day'
    ) AS day
    WHERE b.listing_id = p_listing_id
      AND b.end_date >= current_date
      AND b.start_date <= current_date + 365
      AND (
        b.status IN ('confirmed', 'deposit_paid', 'paid', 'completed')
        OR b.payment_status IN ('deposit_paid', 'paid_in_full')
      )
    GROUP BY day::date
  )
  SELECT r.reserved_date
  FROM reserved_by_date r
  JOIN listing_capacity l ON r.reserved_quantity >= l.quantity
  ORDER BY r.reserved_date;
$$;

REVOKE ALL ON FUNCTION public.get_unavailable_listing_dates(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unavailable_listing_dates(uuid) TO anon, authenticated;

CREATE INDEX IF NOT EXISTS bookings_listing_dates_status_idx
  ON public.bookings (listing_id, start_date, end_date, status, payment_status);

CREATE OR REPLACE FUNCTION public.assert_booking_capacity(
  p_listing_id uuid,
  p_start_date date,
  p_end_date date,
  p_quantity integer,
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity integer;
  v_overbooked boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_listing_id::text, 0));

  SELECT l.quantity INTO v_capacity
  FROM public.listings l
  WHERE l.id = p_listing_id
  FOR UPDATE;

  IF v_capacity IS NULL THEN
    RAISE EXCEPTION 'Listing unavailable';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM generate_series(p_start_date, p_end_date, interval '1 day') AS requested_day
    WHERE coalesce((
      SELECT sum(b.quantity)
      FROM public.bookings b
      WHERE b.listing_id = p_listing_id
        AND b.id IS DISTINCT FROM p_exclude_booking_id
        AND requested_day::date BETWEEN b.start_date AND b.end_date
        AND (
          b.status IN ('confirmed', 'deposit_paid', 'paid', 'completed')
          OR b.payment_status IN ('deposit_paid', 'paid_in_full')
        )
    ), 0) + p_quantity > v_capacity
  ) INTO v_overbooked;

  IF v_overbooked THEN
    RAISE EXCEPTION 'Those dates are no longer available for the requested quantity';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_booking_capacity(uuid, date, date, integer, uuid) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.enforce_booking_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserves_inventory boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF auth.uid() IS NULL
      OR OLD.renter_id IS DISTINCT FROM auth.uid()
      OR OLD.status <> 'pending'
      OR NEW.status <> 'cancelled'
      OR (to_jsonb(NEW) - 'status') IS DISTINCT FROM (to_jsonb(OLD) - 'status') THEN
      RAISE EXCEPTION 'Only a pending booking may be cancelled';
    END IF;
    RETURN NEW;
  END IF;

  v_reserves_inventory :=
    NEW.status IN ('confirmed', 'deposit_paid', 'paid', 'completed')
    OR NEW.payment_status IN ('deposit_paid', 'paid_in_full');

  IF v_reserves_inventory THEN
    PERFORM public.assert_booking_capacity(
      NEW.listing_id,
      NEW.start_date,
      NEW.end_date,
      NEW.quantity,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

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
    'YW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ) RETURNING b.id, b.reference;
END;
$$;

REVOKE ALL ON FUNCTION public.request_booking(uuid, date, date, integer, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_booking(uuid, date, date, integer, text, text, text, text) TO authenticated;