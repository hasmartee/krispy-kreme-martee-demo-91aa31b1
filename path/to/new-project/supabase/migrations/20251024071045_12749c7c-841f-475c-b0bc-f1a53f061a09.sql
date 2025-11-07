-- Create production plans table
CREATE TABLE public.production_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create production allocations table
CREATE TABLE public.production_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_plan_id UUID NOT NULL REFERENCES public.production_plans(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  day_part TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(production_plan_id, store_id, product_id, day_part)
);

-- Enable RLS
ALTER TABLE public.production_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for production_plans
CREATE POLICY "Admins can manage all production plans"
  ON public.production_plans
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Store managers can view production plans"
  ON public.production_plans
  FOR SELECT
  USING (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Store managers can create production plans"
  ON public.production_plans
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for production_allocations
CREATE POLICY "Admins can manage all production allocations"
  ON public.production_allocations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Store staff can view production allocations for their store"
  ON public.production_allocations
  FOR SELECT
  USING (
    (store_id = get_user_store(auth.uid()) AND (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'staff'::app_role)))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Store managers can insert production allocations"
  ON public.production_allocations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update production allocations"
  ON public.production_allocations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_production_plans_updated_at
  BEFORE UPDATE ON public.production_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_allocations_updated_at
  BEFORE UPDATE ON public.production_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_production_plans_date ON public.production_plans(production_date);
CREATE INDEX idx_production_plans_status ON public.production_plans(status);
CREATE INDEX idx_production_allocations_plan ON public.production_allocations(production_plan_id);
CREATE INDEX idx_production_allocations_store ON public.production_allocations(store_id);
CREATE INDEX idx_production_allocations_product ON public.production_allocations(product_id);