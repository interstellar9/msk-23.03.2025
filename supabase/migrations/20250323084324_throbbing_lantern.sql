/*
  # Fix notifications and messages tables

  1. Changes
    - Update notifications RLS policies to allow trigger-created notifications
    - Fix messages table foreign key to reference listings instead of announcements
    - Update message notification trigger
*/

-- Drop and recreate notifications policies
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

-- Fix messages table foreign key
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_announcement_id_fkey;

ALTER TABLE messages 
RENAME COLUMN announcement_id TO listing_id;

ALTER TABLE messages
ADD CONSTRAINT messages_listing_id_fkey 
FOREIGN KEY (listing_id) 
REFERENCES listings(id) 
ON DELETE CASCADE;

-- Update message notification trigger
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