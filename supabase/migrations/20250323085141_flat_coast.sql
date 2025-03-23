/*
  # Add Payment System

  1. New Tables
    - `payments`
      - Payment information and status
      - Links to listings and users
    - `msk_transactions`
      - MSK token balance and transaction history
    - `payment_methods`
      - Stored payment methods for users

  2. Security
    - RLS policies for all new tables
    - Secure handling of payment data
*/

-- Create payment_methods table
CREATE TABLE payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('card', 'blik')),
  card_last4 text,
  card_brand text,
  created_at timestamptz DEFAULT now(),
  is_default boolean DEFAULT false
);

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method_id uuid REFERENCES payment_methods(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  transaction_ref text
);

-- Create msk_transactions table
CREATE TABLE msk_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('reward', 'transfer')),
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  description text
);

-- Add balance column to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS msk_balance numeric DEFAULT 0 CHECK (msk_balance >= 0);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE msk_transactions ENABLE ROW LEVEL SECURITY;

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
ON payment_methods FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own payment methods"
ON payment_methods FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- MSK transactions policies
CREATE POLICY "Users can view their own transactions"
ON msk_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Function to handle MSK token rewards
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
DECLARE
  reward_amount numeric;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate reward (10% of payment amount)
    reward_amount := NEW.amount * 0.1;
    
    -- Create MSK transaction
    INSERT INTO msk_transactions (
      user_id,
      amount,
      type,
      payment_id,
      description
    ) VALUES (
      NEW.user_id,
      reward_amount,
      'reward',
      NEW.id,
      'Payment reward'
    );
    
    -- Update user balance
    UPDATE users
    SET msk_balance = msk_balance + reward_amount
    WHERE id = NEW.user_id;
    
    -- Create notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link
    ) VALUES (
      NEW.user_id,
      'system',
      'MSK Tokens Received',
      'You received ' || reward_amount || ' MSK tokens for your payment',
      '/dashboard/wallet'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payment completion
CREATE TRIGGER on_payment_completion
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_completion();

-- Create indexes
CREATE INDEX payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX payments_user_id_idx ON payments(user_id);
CREATE INDEX payments_listing_id_idx ON payments(listing_id);
CREATE INDEX msk_transactions_user_id_idx ON msk_transactions(user_id);
CREATE INDEX msk_transactions_payment_id_idx ON msk_transactions(payment_id);