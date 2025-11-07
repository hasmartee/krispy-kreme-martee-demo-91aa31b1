-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  seniority TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  available_days TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_logs table
CREATE TABLE public.delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
  received_by TEXT NOT NULL,
  receipt_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_items table
CREATE TABLE public.delivery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_log_id UUID NOT NULL REFERENCES public.delivery_logs(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity_ordered NUMERIC NOT NULL,
  quantity_received NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Admins can manage all team members"
  ON public.team_members FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Store managers can manage their store team members"
  ON public.team_members FOR ALL
  USING (store_id = get_user_store(auth.uid()) AND has_role(auth.uid(), 'store_manager'));

CREATE POLICY "Staff can view their store team members"
  ON public.team_members FOR SELECT
  USING (store_id = get_user_store(auth.uid()) AND (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff')));

-- RLS Policies for delivery_logs
CREATE POLICY "Admins can manage all delivery logs"
  ON public.delivery_logs FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Store managers can manage their store delivery logs"
  ON public.delivery_logs FOR ALL
  USING (store_id = get_user_store(auth.uid()) AND has_role(auth.uid(), 'store_manager'));

CREATE POLICY "Staff can view their store delivery logs"
  ON public.delivery_logs FOR SELECT
  USING (store_id = get_user_store(auth.uid()) AND (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff')));

-- RLS Policies for delivery_items
CREATE POLICY "Admins can manage all delivery items"
  ON public.delivery_items FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Store staff can view delivery items"
  ON public.delivery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_logs 
      WHERE id = delivery_items.delivery_log_id 
      AND store_id = get_user_store(auth.uid())
    ) AND (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff'))
  );

CREATE POLICY "Store managers can manage delivery items"
  ON public.delivery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.delivery_logs 
      WHERE id = delivery_items.delivery_log_id 
      AND store_id = get_user_store(auth.uid())
    ) AND has_role(auth.uid(), 'store_manager')
  );

-- Create storage bucket for delivery receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-receipts', 'delivery-receipts', false);

-- Storage policies for delivery receipts
CREATE POLICY "Users can view their store delivery receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'delivery-receipts' AND
    (has_role(auth.uid(), 'admin') OR 
     auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Store managers can upload delivery receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'delivery-receipts' AND
    has_role(auth.uid(), 'store_manager')
  );

-- Triggers
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_logs_updated_at
  BEFORE UPDATE ON public.delivery_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();