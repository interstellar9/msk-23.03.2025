/*
  # Fix notifications RLS policies and triggers

  1. Changes
    - Add RLS policies for notifications table
    - Update message notification trigger
    - Fix notification creation permissions
*/

-- Enable RLS on notifications if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Create new policies
CREATE POLICY "Users can read their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update the message notification trigger function
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