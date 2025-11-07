-- Add product_sku column to production_allocations
ALTER TABLE public.production_allocations 
  ADD COLUMN IF NOT EXISTS product_sku TEXT;

-- Update existing rows to use empty string for now
UPDATE public.production_allocations SET product_sku = '' WHERE product_sku IS NULL;

-- Make product_sku NOT NULL
ALTER TABLE public.production_allocations ALTER COLUMN product_sku SET NOT NULL;

-- Make product_id nullable
ALTER TABLE public.production_allocations ALTER COLUMN product_id DROP NOT NULL;