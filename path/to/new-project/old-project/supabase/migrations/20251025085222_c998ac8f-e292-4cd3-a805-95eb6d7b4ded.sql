-- Add unique constraint to production_allocations table
-- This allows upsert operations based on production_plan_id, store_id, and product_sku
ALTER TABLE public.production_allocations 
ADD CONSTRAINT production_allocations_plan_store_product_unique 
UNIQUE (production_plan_id, store_id, product_sku);