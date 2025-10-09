-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ingredients_inventory table to track ingredient stock per store
CREATE TABLE public.ingredients_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  min_stock_level NUMERIC NOT NULL DEFAULT 0,
  updated_by UUID REFERENCES auth.users(id),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ingredient_id, store_id)
);

-- Create recipe_ingredients table to link products with their ingredients
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, ingredient_id)
);

-- Create ingredient_suppliers table to track which suppliers provide which ingredients
CREATE TABLE public.ingredient_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ingredients
CREATE POLICY "Admins can manage ingredients"
  ON public.ingredients
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view ingredients"
  ON public.ingredients
  FOR SELECT
  USING (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for ingredients_inventory
CREATE POLICY "Admins can manage all ingredients inventory"
  ON public.ingredients_inventory
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Store managers can update their store ingredients inventory"
  ON public.ingredients_inventory
  FOR UPDATE
  USING (store_id = get_user_store(auth.uid()) AND has_role(auth.uid(), 'store_manager'));

CREATE POLICY "Store staff can view their store ingredients inventory"
  ON public.ingredients_inventory
  FOR SELECT
  USING (store_id = get_user_store(auth.uid()) AND (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Store managers can insert their store ingredients inventory"
  ON public.ingredients_inventory
  FOR INSERT
  WITH CHECK (store_id = get_user_store(auth.uid()) AND has_role(auth.uid(), 'store_manager'));

-- RLS Policies for recipe_ingredients
CREATE POLICY "Admins can manage recipe ingredients"
  ON public.recipe_ingredients
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view recipe ingredients"
  ON public.recipe_ingredients
  FOR SELECT
  USING (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for ingredient_suppliers
CREATE POLICY "Admins can manage ingredient suppliers"
  ON public.ingredient_suppliers
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view ingredient suppliers"
  ON public.ingredient_suppliers
  FOR SELECT
  USING (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff'));

-- Create trigger for updating updated_at on ingredients
CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at on recipe_ingredients
CREATE TRIGGER update_recipe_ingredients_updated_at
  BEFORE UPDATE ON public.recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();