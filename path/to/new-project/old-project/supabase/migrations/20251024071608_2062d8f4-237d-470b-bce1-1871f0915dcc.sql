-- Add product_sku column to production_allocations and make product_id nullable
ALTER TABLE public.production_allocations 
  ALTER COLUMN product_id DROP NOT NULL,
  ADD COLUMN product_sku TEXT;

-- Update existing rows to have empty SKU
UPDATE public.production_allocations SET product_sku = '' WHERE product_sku IS NULL;

-- Make product_sku NOT NULL
ALTER TABLE public.production_allocations ALTER COLUMN product_sku SET NOT NULL;

-- Drop the old unique constraint (checking the actual name from the table definition)
ALTER TABLE public.production_allocations
  DROP CONSTRAINT IF EXISTS production_allocations_production_plan_id_store_id_product__key;

-- Create new unique constraint using SKU
ALTER TABLE public.production_allocations
  ADD CONSTRAINT production_allocations_plan_store_sku_daypart_unique 
  UNIQUE(production_plan_id, store_id, product_sku, day_part);