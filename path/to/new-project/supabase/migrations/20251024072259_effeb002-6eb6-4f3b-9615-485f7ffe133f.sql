-- Enable realtime for production tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_allocations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_plans;