-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;

-- Create new update policy that includes admins
CREATE POLICY "Users can update their own services or admins can update any"
ON public.services
FOR UPDATE
USING (
  (auth.uid() = user_id) 
  OR is_super_admin(auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Also update the SELECT policy to ensure admins can see all services
DROP POLICY IF EXISTS "Anyone can view approved services" ON public.services;

CREATE POLICY "Anyone can view approved services or admins can view all"
ON public.services
FOR SELECT
USING (
  (status = 'approved'::text) 
  OR (auth.uid() = user_id) 
  OR is_super_admin(auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role)
);