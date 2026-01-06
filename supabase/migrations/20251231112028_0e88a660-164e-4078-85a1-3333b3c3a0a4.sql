-- Create categories table with ownership
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table with ownership
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  price_type TEXT DEFAULT 'fixed',
  images TEXT[],
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Categories RLS Policies
CREATE POLICY "Users can view all categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Users can create their own categories"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

CREATE POLICY "Users can delete their own categories"
ON public.categories FOR DELETE
USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- Services RLS Policies
CREATE POLICY "Anyone can view published services"
ON public.services FOR SELECT
USING (status = 'published' OR auth.uid() = user_id OR public.is_super_admin(auth.uid()));

CREATE POLICY "Users can create their own services"
ON public.services FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
ON public.services FOR UPDATE
USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

CREATE POLICY "Users can delete their own services"
ON public.services FOR DELETE
USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- Update profiles RLS to allow super_admin full access
CREATE POLICY "Super admin can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can delete profiles"
ON public.profiles FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- Update user_roles to allow super_admin to manage all roles
CREATE POLICY "Super admin can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();