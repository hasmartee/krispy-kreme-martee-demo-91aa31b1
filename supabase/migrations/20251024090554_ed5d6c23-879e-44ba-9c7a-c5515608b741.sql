-- Add manufactured_quantity column to production_allocations table
ALTER TABLE public.production_allocations 
ADD COLUMN manufactured_quantity integer DEFAULT 0;

-- Add comment
COMMENT ON COLUMN public.production_allocations.manufactured_quantity IS 'Actual quantity manufactured by production facility';