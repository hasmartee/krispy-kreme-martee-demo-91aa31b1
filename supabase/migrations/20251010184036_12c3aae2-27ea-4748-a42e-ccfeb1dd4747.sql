-- Add policy to allow authenticated users to view all stores
-- This is needed for the Range Plans page to display all stores by cluster
CREATE POLICY "Authenticated users can view all stores"
ON public.stores
FOR SELECT
TO authenticated
USING (true);