-- Add foreign key relationship between stock_adjustments and products
ALTER TABLE public.stock_adjustments
ADD CONSTRAINT stock_adjustments_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;