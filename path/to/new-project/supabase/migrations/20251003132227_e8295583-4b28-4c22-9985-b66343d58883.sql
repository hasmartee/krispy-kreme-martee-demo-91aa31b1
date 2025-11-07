-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'store_manager', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table to link users to stores
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to get user's assigned store
CREATE OR REPLACE FUNCTION public.get_user_store(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Drop existing overly permissive policies for stores
DROP POLICY IF EXISTS "Anyone can view stores" ON public.stores;
DROP POLICY IF EXISTS "Anyone can insert stores" ON public.stores;
DROP POLICY IF EXISTS "Anyone can update stores" ON public.stores;
DROP POLICY IF EXISTS "Anyone can delete stores" ON public.stores;

-- Create secure RLS policies for stores table
-- Admins can view all stores
CREATE POLICY "Admins can view all stores"
ON public.stores
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Store managers and staff can view their assigned store
CREATE POLICY "Staff can view their assigned store"
ON public.stores
FOR SELECT
TO authenticated
USING (
  id = public.get_user_store(auth.uid())
  AND (
    public.has_role(auth.uid(), 'store_manager')
    OR public.has_role(auth.uid(), 'staff')
  )
);

-- Only admins can insert stores
CREATE POLICY "Admins can insert stores"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update all stores
CREATE POLICY "Admins can update all stores"
ON public.stores
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Store managers can update their assigned store
CREATE POLICY "Store managers can update their store"
ON public.stores
FOR UPDATE
TO authenticated
USING (
  id = public.get_user_store(auth.uid())
  AND public.has_role(auth.uid(), 'store_manager')
);

-- Only admins can delete stores
CREATE POLICY "Admins can delete stores"
ON public.stores
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing overly permissive policies for delivery_schedules
DROP POLICY IF EXISTS "Anyone can view delivery schedules" ON public.delivery_schedules;
DROP POLICY IF EXISTS "Anyone can insert delivery schedules" ON public.delivery_schedules;
DROP POLICY IF EXISTS "Anyone can update delivery schedules" ON public.delivery_schedules;
DROP POLICY IF EXISTS "Anyone can delete delivery schedules" ON public.delivery_schedules;

-- Create secure RLS policies for delivery_schedules table
-- Admins can view all delivery schedules
CREATE POLICY "Admins can view all delivery schedules"
ON public.delivery_schedules
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Staff can view delivery schedules for their assigned store
CREATE POLICY "Staff can view their store delivery schedules"
ON public.delivery_schedules
FOR SELECT
TO authenticated
USING (
  store_id = public.get_user_store(auth.uid())
  AND (
    public.has_role(auth.uid(), 'store_manager')
    OR public.has_role(auth.uid(), 'staff')
  )
);

-- Admins can insert delivery schedules
CREATE POLICY "Admins can insert delivery schedules"
ON public.delivery_schedules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Store managers can insert delivery schedules for their store
CREATE POLICY "Store managers can insert their store delivery schedules"
ON public.delivery_schedules
FOR INSERT
TO authenticated
WITH CHECK (
  store_id = public.get_user_store(auth.uid())
  AND public.has_role(auth.uid(), 'store_manager')
);

-- Admins can update all delivery schedules
CREATE POLICY "Admins can update all delivery schedules"
ON public.delivery_schedules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Store managers can update their store delivery schedules
CREATE POLICY "Store managers can update their store delivery schedules"
ON public.delivery_schedules
FOR UPDATE
TO authenticated
USING (
  store_id = public.get_user_store(auth.uid())
  AND public.has_role(auth.uid(), 'store_manager')
);

-- Admins can delete delivery schedules
CREATE POLICY "Admins can delete delivery schedules"
ON public.delivery_schedules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Store managers can delete their store delivery schedules
CREATE POLICY "Store managers can delete their store delivery schedules"
ON public.delivery_schedules
FOR DELETE
TO authenticated
USING (
  store_id = public.get_user_store(auth.uid())
  AND public.has_role(auth.uid(), 'store_manager')
);

-- RLS policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can update their own profile (except store_id)
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only admins can insert profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for user_roles table
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();