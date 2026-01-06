-- Add phone and bio columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- Add foreign key constraint from services to profiles for proper relationships
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_user_id_fkey;
ALTER TABLE public.services ADD CONSTRAINT services_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from categories to profiles
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE public.categories ADD CONSTRAINT categories_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;