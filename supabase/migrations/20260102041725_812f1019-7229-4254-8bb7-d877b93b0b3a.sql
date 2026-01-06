-- Update RLS policy for services to show only approved services publicly
-- First drop the existing policy
DROP POLICY IF EXISTS "Anyone can view published services" ON public.services;

-- Create new policy that shows only approved services (and owner's own services, plus super_admin access)
CREATE POLICY "Anyone can view approved services" 
ON public.services 
FOR SELECT 
USING (
  (status = 'approved') 
  OR (auth.uid() = user_id) 
  OR is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'admin')
);