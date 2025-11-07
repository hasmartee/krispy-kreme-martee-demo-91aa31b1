-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text,
  unit text NOT NULL DEFAULT 'unit',
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create store_inventory table to track stock levels
CREATE TABLE public.store_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  current_stock integer NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, product_id)
);

-- Create par_levels table with AI suggestions and manual overrides
CREATE TABLE public.par_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  month integer CHECK (month >= 1 AND month <= 12),
  suggested_par_level integer NOT NULL,
  manual_override integer,
  is_overridden boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, product_id, day_of_week, month)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.par_levels ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view products"
ON public.products FOR SELECT
USING (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Store inventory policies
CREATE POLICY "Admins can manage all inventory"
ON public.store_inventory FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Store staff can view their store inventory"
ON public.store_inventory FOR SELECT
USING ((store_id = get_user_store(auth.uid())) AND (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'staff'::app_role)));

CREATE POLICY "Store managers can update their store inventory"
ON public.store_inventory FOR UPDATE
USING ((store_id = get_user_store(auth.uid())) AND has_role(auth.uid(), 'store_manager'::app_role));

CREATE POLICY "Store managers can insert their store inventory"
ON public.store_inventory FOR INSERT
WITH CHECK ((store_id = get_user_store(auth.uid())) AND has_role(auth.uid(), 'store_manager'::app_role));

-- Par levels policies
CREATE POLICY "Admins can manage all par levels"
ON public.par_levels FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Store staff can view their store par levels"
ON public.par_levels FOR SELECT
USING ((store_id = get_user_store(auth.uid())) AND (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'staff'::app_role)));

CREATE POLICY "Store managers can update their store par levels"
ON public.par_levels FOR UPDATE
USING ((store_id = get_user_store(auth.uid())) AND has_role(auth.uid(), 'store_manager'::app_role));

CREATE POLICY "Store managers can insert their store par levels"
ON public.par_levels FOR INSERT
WITH CHECK ((store_id = get_user_store(auth.uid())) AND has_role(auth.uid(), 'store_manager'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_par_levels_updated_at
BEFORE UPDATE ON public.par_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_store_inventory_store ON public.store_inventory(store_id);
CREATE INDEX idx_store_inventory_product ON public.store_inventory(product_id);
CREATE INDEX idx_par_levels_store_product ON public.par_levels(store_id, product_id);