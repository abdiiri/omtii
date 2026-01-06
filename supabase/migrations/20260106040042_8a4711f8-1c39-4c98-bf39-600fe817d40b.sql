-- Create messages table for vendor-client communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages (insert) if they are the sender
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read if they are the receiver
CREATE POLICY "Receivers can update message read status"
ON public.messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Create index for faster queries
CREATE INDEX idx_messages_service_request_id ON public.messages(service_request_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;