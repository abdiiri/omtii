-- Add foreign key references for service_requests to enable proper joins
ALTER TABLE public.service_requests
ADD CONSTRAINT service_requests_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.service_requests
ADD CONSTRAINT service_requests_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;