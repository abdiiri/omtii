-- Allow vendors to view profiles of clients who have requested their services
CREATE POLICY "Vendors can view profiles of clients who requested their services"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.client_id = profiles.id
    AND sr.vendor_id = auth.uid()
  )
);