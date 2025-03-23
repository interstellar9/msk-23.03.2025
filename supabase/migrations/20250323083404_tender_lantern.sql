/*
  # Fix listings RLS policies

  1. Changes
    - Drop existing RLS policies for listings table
    - Create new, corrected policies that properly handle entrepreneur access
    - Ensure policies match the user_type values in the application
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Entrepreneurs can create listings" ON listings;
DROP POLICY IF EXISTS "Entrepreneurs can update their own listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;

-- Create new policies with correct user types
CREATE POLICY "Anyone can view listings"
ON listings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Entrepreneurs can create listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND user_type = 'przedsiebiorca'
  )
);

CREATE POLICY "Entrepreneurs can update their own listings"
ON listings FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND user_type = 'przedsiebiorca'
  )
)
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND user_type = 'przedsiebiorca'
  )
);

CREATE POLICY "Entrepreneurs can delete their own listings"
ON listings FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND user_type = 'przedsiebiorca'
  )
);