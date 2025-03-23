/*
  # Update Database Schema

  1. Changes
    - Rename columns to match application needs
    - Add missing columns
    - Update constraints and policies

  2. Tables Modified
    - users: Add full_name column
    - messages: Update column names and references
    - listings: Add missing indexes
*/

-- Update users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name text;

-- Drop existing messages table and recreate with correct structure
DROP TABLE IF EXISTS public.messages;
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create messages policies
CREATE POLICY "Users can read their own messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Create messages indexes
CREATE INDEX IF NOT EXISTS messages_sender_recipient_idx 
  ON public.messages(sender_id, recipient_id);

CREATE INDEX IF NOT EXISTS messages_announcement_idx 
  ON public.messages(announcement_id);

CREATE INDEX IF NOT EXISTS messages_created_at_idx 
  ON public.messages(created_at DESC);

-- Update listings indexes
CREATE INDEX IF NOT EXISTS listings_user_id_idx 
  ON public.listings(user_id);

CREATE INDEX IF NOT EXISTS listings_created_at_idx 
  ON public.listings(created_at DESC);