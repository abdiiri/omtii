-- Allow anyone to view profiles of users who have approved services (for vendor display)
CREATE POLICY "Anyone can view vendor profiles with approved services"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.user_id = profiles.id 
    AND services.status = 'approved'
  )
);

-- Create service_requests table for clients to request services
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Clients can create requests
CREATE POLICY "Clients can create service requests"
ON public.service_requests
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Clients can view their own requests
CREATE POLICY "Clients can view their own requests"
ON public.service_requests
FOR SELECT
USING (auth.uid() = client_id);

-- Vendors can view requests for their services
CREATE POLICY "Vendors can view requests for their services"
ON public.service_requests
FOR SELECT
USING (auth.uid() = vendor_id);

-- Vendors can update request status
CREATE POLICY "Vendors can update request status"
ON public.service_requests
FOR UPDATE
USING (auth.uid() = vendor_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.service_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for service_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;