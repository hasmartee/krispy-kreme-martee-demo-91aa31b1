-- Create stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  postcode TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  manager TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  opening_hours TEXT NOT NULL,
  daily_target DECIMAL NOT NULL DEFAULT 0,
  weekly_average DECIMAL NOT NULL DEFAULT 0,
  cluster TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_schedules table
CREATE TABLE public.delivery_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  supplier TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for stores (public read access for authenticated users)
CREATE POLICY "Anyone can view stores" 
ON public.stores 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert stores" 
ON public.stores 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update stores" 
ON public.stores 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete stores" 
ON public.stores 
FOR DELETE 
USING (true);

-- Create policies for delivery_schedules (public read access for authenticated users)
CREATE POLICY "Anyone can view delivery schedules" 
ON public.delivery_schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert delivery schedules" 
ON public.delivery_schedules 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update delivery schedules" 
ON public.delivery_schedules 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete delivery schedules" 
ON public.delivery_schedules 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_schedules_updated_at
BEFORE UPDATE ON public.delivery_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_delivery_schedules_store_id ON public.delivery_schedules(store_id);
CREATE INDEX idx_delivery_schedules_day_of_week ON public.delivery_schedules(day_of_week);