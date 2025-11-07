-- Create product_capacities table to store min/max capacity per product per store
CREATE TABLE IF NOT EXISTS public.product_capacities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_sku TEXT NOT NULL,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  capacity_min INTEGER NOT NULL DEFAULT 0,
  capacity_max INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_sku, store_id)
);

-- Enable Row Level Security
ALTER TABLE public.product_capacities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_capacities
CREATE POLICY "Admins can manage all product capacities"
ON public.product_capacities
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all product capacities"
ON public.product_capacities
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Store staff can view their store product capacities"
ON public.product_capacities
FOR SELECT
TO authenticated
USING (
  (store_id = get_user_store(auth.uid())) AND 
  (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

CREATE POLICY "Admins can insert product capacities"
ON public.product_capacities
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product capacities"
ON public.product_capacities
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_capacities_updated_at
BEFORE UPDATE ON public.product_capacities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_product_capacities_store_sku ON public.product_capacities(store_id, product_sku);