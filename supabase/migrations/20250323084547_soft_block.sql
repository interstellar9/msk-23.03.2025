/*
  # Fix messages and likes system

  1. Changes
    - Update messages table structure and constraints
    - Fix notifications policies and triggers
    - Update likes table policies
    - Add proper indexes for performance

  2. Security
    - Update RLS policies for all affected tables
    - Add security definer to triggers
*/

-- Drop existing foreign key if exists
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_announcement_id_fkey;

-- Rename column and add new foreign key
ALTER TABLE messages 
DROP COLUMN IF EXISTS announcement_id;

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES listings(id) ON DELETE CASCADE;

-- Update messages policies
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

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
    SELECT 1 FROM listings
    WHERE id = listing_id
  )
);

-- Update notifications policies
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can read their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON notifications FOR ALL
USING (true)
WITH CHECK (true);

-- Update likes policies
DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Users can view their own likes"
ON likes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own likes"
ON likes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM listings
    WHERE id = listing_id
  )
);

CREATE POLICY "Users can delete their own likes"
ON likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update triggers to use security definer
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    related_user_id,
    link
  )
  VALUES (
    NEW.recipient_id,
    'message',
    'Nowa wiadomość',
    (SELECT full_name FROM users WHERE id = NEW.sender_id) || ' wysłał(a) Ci wiadomość',
    NEW.sender_id,
    '/messages'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    related_user_id,
    link
  )
  SELECT
    listings.user_id,
    'like',
    'Nowe polubienie',
    (SELECT full_name FROM users WHERE id = NEW.user_id) || ' polubił(a) Twoje ogłoszenie: ' || listings.title,
    NEW.user_id,
    '/listings/' || listings.id
  FROM listings
  WHERE listings.id = NEW.listing_id
  AND listings.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS messages_listing_id_idx ON messages(listing_id);
CREATE INDEX IF NOT EXISTS likes_listing_id_idx ON likes(listing_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);