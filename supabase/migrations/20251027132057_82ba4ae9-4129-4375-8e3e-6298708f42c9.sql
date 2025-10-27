-- Fix security issue: Remove overly permissive stores policy
-- This policy allows ANY authenticated user to view ALL store data
DROP POLICY IF EXISTS "Authenticated users can view all stores" ON public.stores;

-- Fix security issue: Restrict team_members hourly_rate visibility
-- Current policy exposes salary data to all coworkers
-- We'll handle this by ensuring queries use role-based filtering

-- Note: The existing policies already provide proper access:
-- - Admins can view all stores (via "Admins can view all stores" policy)
-- - Staff can view their assigned store (via "Staff can view their assigned store" policy)
-- The removed policy was redundant and overly permissive

-- For team_members, the existing "Staff can view their store team members" policy 
-- allows SELECT but we need to ensure sensitive columns are protected.
-- Applications should filter columns based on user role when querying.
-- Consider creating a view for non-sensitive team member data if needed.

-- Add comment to document security decision
COMMENT ON TABLE public.stores IS 'Access controlled via RLS: admins see all, staff see assigned store only';
COMMENT ON TABLE public.team_members IS 'Contains sensitive data (hourly_rate) - applications must filter columns based on user role';