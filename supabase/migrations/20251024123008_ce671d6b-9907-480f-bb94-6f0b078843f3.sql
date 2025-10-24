-- Create stock_adjustments table
CREATE TABLE public.stock_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  product_id UUID NOT NULL,
  adjustment_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  comment TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

-- Policies for stock_adjustments
CREATE POLICY "Admins can manage all stock adjustments"
  ON public.stock_adjustments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Store staff can view their store stock adjustments"
  ON public.stock_adjustments
  FOR SELECT
  USING (
    store_id = get_user_store(auth.uid()) 
    AND (has_role(auth.uid(), 'store_manager'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
  );

CREATE POLICY "Store managers can insert their store stock adjustments"
  ON public.stock_adjustments
  FOR INSERT
  WITH CHECK (
    store_id = get_user_store(auth.uid()) 
    AND has_role(auth.uid(), 'store_manager'::app_role)
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stock_adjustments_updated_at
  BEFORE UPDATE ON public.stock_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();