/*
  # Add likes and enhanced filtering for listings

  1. New Tables
    - `likes` - Stores user likes for listings
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `listing_id` (uuid, references listings)
      - `created_at` (timestamp)

  2. Changes to Listings
    - Add `status` column for filtering active/inactive listings
    - Add `likes_count` column for tracking total likes
    - Add indexes for better filtering and sorting

  3. Security
    - Enable RLS on likes table
    - Add policies for likes management
*/

-- Add status to listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'inactive', 'expired'));

-- Add likes count to listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(price);
CREATE INDEX IF NOT EXISTS listings_likes_count_idx ON listings(likes_count);
CREATE INDEX IF NOT EXISTS likes_user_listing_idx ON likes(user_id, listing_id);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policies for likes
CREATE POLICY "Users can view their own likes"
ON likes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own likes"
ON likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
DROP TRIGGER IF EXISTS update_listing_likes_count ON likes;
CREATE TRIGGER update_listing_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();