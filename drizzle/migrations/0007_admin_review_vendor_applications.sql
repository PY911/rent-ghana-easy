GRANT UPDATE (status) ON public.vendor_applications TO authenticated;
CREATE POLICY vendor_applications_admin_update ON public.vendor_applications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND status IN ('pending','reviewed','approved','declined'));