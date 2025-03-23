/*
  # Fix messages RLS policies

  1. Changes
    - Update RLS policies for messages table
    - Add proper checks for message creation
*/

-- Enable RLS on messages if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create new policies
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() OR
  recipient_id = auth.uid()
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
  )
);