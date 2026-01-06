-- Add policy for admins to view all profiles (for admin dashboard)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to update profiles (except super_admin users)
CREATE POLICY "Admins can update non-super-admin profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND NOT is_super_admin(id)
);

-- Add policy for admins to manage non-super-admin roles
CREATE POLICY "Admins can insert non-super-admin roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role != 'super_admin'::app_role
);

CREATE POLICY "Admins can delete non-super-admin roles" 
ON public.user_roles 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role != 'super_admin'::app_role
);