-- Add received_quantity column to production_allocations to track confirmed deliveries
ALTER TABLE public.production_allocations 
ADD COLUMN received_quantity integer DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN public.production_allocations.received_quantity IS 'Quantity actually received by the store (confirmed delivery)';