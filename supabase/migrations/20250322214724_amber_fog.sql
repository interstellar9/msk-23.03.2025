/*
  # Initial Schema Setup for Urban Contact Network

  1. Tables
    - users (extends auth.users)
      - user_type (text): 'resident' or 'entrepreneur'
      - full_name (text)
    - listings
      - Basic listing information
      - Category and location
      - Price (optional)
    - messages
      - Communication between users
      - Related to specific announcements
    
  2. Security
    - RLS policies for each table
    - Secure access control based on user types
*/

-- Users table extension (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  user_type text NOT NULL CHECK (user_type IN ('resident', 'entrepreneur')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and create policies for users table
DO $$ 
BEGIN
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read their own data'
  ) THEN
    CREATE POLICY "Users can read their own data"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  price decimal,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policies for listings table
DO $$ 
BEGIN
  ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Anyone can view listings'
  ) THEN
    CREATE POLICY "Anyone can view listings"
      ON public.listings
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Entrepreneurs can create listings'
  ) THEN
    CREATE POLICY "Entrepreneurs can create listings"
      ON public.listings
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid()
          AND user_type = 'entrepreneur'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Entrepreneurs can update their own listings'
  ) THEN
    CREATE POLICY "Entrepreneurs can update their own listings"
      ON public.listings
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid()
          AND user_type = 'entrepreneur'
        )
      );
  END IF;
END $$;

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.users(id) NOT NULL,
  recipient_id uuid REFERENCES public.users(id) NOT NULL,
  announcement_id uuid REFERENCES public.listings(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Enable RLS and create policies for messages table
DO $$ 
BEGIN
  ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can read their own messages'
  ) THEN
    CREATE POLICY "Users can read their own messages"
      ON public.messages
      FOR SELECT
      TO authenticated
      USING (
        sender_id = auth.uid() OR
        recipient_id = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
      ON public.messages
      FOR INSERT
      TO authenticated
      WITH CHECK (sender_id = auth.uid());
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'listings_category_idx'
  ) THEN
    CREATE INDEX listings_category_idx ON public.listings(category);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'listings_location_idx'
  ) THEN
    CREATE INDEX listings_location_idx ON public.listings(location);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'messages_sender_recipient_idx'
  ) THEN
    CREATE INDEX messages_sender_recipient_idx ON public.messages(sender_id, recipient_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'messages_announcement_idx'
  ) THEN
    CREATE INDEX messages_announcement_idx ON public.messages(announcement_id);
  END IF;
END $$;