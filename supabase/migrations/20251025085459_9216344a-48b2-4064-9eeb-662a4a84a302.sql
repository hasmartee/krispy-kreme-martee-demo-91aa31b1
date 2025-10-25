-- Drop the incorrect unique constraint
ALTER TABLE public.production_allocations 
DROP CONSTRAINT IF EXISTS production_allocations_plan_store_product_unique;

-- Add correct unique constraint including day_part
ALTER TABLE public.production_allocations 
ADD CONSTRAINT production_allocations_plan_store_product_day_unique 
UNIQUE (production_plan_id, store_id, product_sku, day_part);