/*
  # Add notifications system

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (text)
      - `title` (text)
      - `content` (text)
      - `link` (text, optional)
      - `related_user_id` (uuid, references users)
      - `created_at` (timestamp)
      - `read_at` (timestamp, optional)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for authenticated users to read their own notifications
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'like', 'system')),
  title text NOT NULL,
  content text NOT NULL,
  link text,
  related_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Add indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_at_idx ON notifications(read_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can read their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Function to create notification for new messages
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
$$ LANGUAGE plpgsql;

-- Function to create notification for new likes
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
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

DROP TRIGGER IF EXISTS on_new_like ON likes;
CREATE TRIGGER on_new_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();