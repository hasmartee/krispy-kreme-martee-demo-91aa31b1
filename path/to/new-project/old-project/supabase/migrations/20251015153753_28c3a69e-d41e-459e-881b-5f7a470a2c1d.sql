-- Update RLS policy for team_messages to allow store staff to insert messages
-- The current policy requires roles which might not be set up yet
-- This updated policy allows any authenticated user to insert messages for their own user_id

DROP POLICY IF EXISTS "Store staff can create team messages" ON public.team_messages;

CREATE POLICY "Authenticated users can create team messages"
ON public.team_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);