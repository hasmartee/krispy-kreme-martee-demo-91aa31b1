-- Create team_messages table for HQ inbox
CREATE TABLE public.team_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('issue', 'observation', 'comment', 'equipment', 'delivery', 'contamination', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Admins can view and update all messages
CREATE POLICY "Admins can view all team messages"
ON public.team_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team messages"
ON public.team_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Store staff can insert messages
CREATE POLICY "Store staff can create team messages"
ON public.team_messages
FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff'))
  AND auth.uid() = user_id
);

-- Store staff can view their own messages
CREATE POLICY "Store staff can view their own messages"
ON public.team_messages
FOR SELECT
USING (
  (has_role(auth.uid(), 'store_manager') OR has_role(auth.uid(), 'staff'))
  AND auth.uid() = user_id
);

-- Create trigger for updated_at
CREATE TRIGGER update_team_messages_updated_at
BEFORE UPDATE ON public.team_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();