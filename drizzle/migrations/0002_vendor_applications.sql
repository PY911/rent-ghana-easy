CREATE TABLE public.vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL CHECK (char_length(trim(business_name)) BETWEEN 2 AND 150),
  contact_name text NOT NULL CHECK (char_length(trim(contact_name)) BETWEEN 2 AND 150),
  email text NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 254),
  phone text NOT NULL CHECK (char_length(trim(phone)) BETWEEN 7 AND 30),
  whatsapp text,
  city text NOT NULL CHECK (char_length(trim(city)) BETWEEN 2 AND 100),
  address text NOT NULL CHECK (char_length(trim(address)) BETWEEN 5 AND 300),
  business_description text NOT NULL CHECK (char_length(trim(business_description)) BETWEEN 20 AND 2000),
  inventory_details text NOT NULL CHECK (char_length(trim(inventory_details)) BETWEEN 10 AND 4000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.vendor_applications TO authenticated;
GRANT ALL ON public.vendor_applications TO service_role;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_applications_read_own ON public.vendor_applications FOR SELECT TO authenticated USING (applicant_id = auth.uid());
CREATE POLICY vendor_applications_insert_own ON public.vendor_applications FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid() AND status = 'pending');
CREATE POLICY vendor_applications_admin_read ON public.vendor_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX vendor_applications_applicant_created_idx ON public.vendor_applications (applicant_id, created_at DESC);