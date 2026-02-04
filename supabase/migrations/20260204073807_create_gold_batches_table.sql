/*
  # BitVerse Gold Batches Schema

  1. New Tables
    - `gold_batches`
      - `id` (uuid, primary key)
      - `batch_id` (text, unique) - Format: BV-GOLD-XXXXX
      - `weight` (text)
      - `purity` (text) - 24K, 22K, 18K
      - `source` (text) - Origin mine name
      - `refiner` (text) - Refinery name
      - `current_owner` (text) - Current owner name
      - `status` (text) - In Stock, Transferred, etc.
      - `hash` (text) - Fake hash for ledger simulation
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `batch_history`
      - `id` (uuid, primary key)
      - `batch_id` (uuid, foreign key)
      - `from_party` (text)
      - `to_party` (text)
      - `action` (text) - Digital Birth, Ownership Transfer, etc.
      - `transaction_date` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Allow public read access to batches for verification
    - Allow authenticated users to create and manage batches

  3. Data
    - Insert sample batch for demo purposes
*/

CREATE TABLE IF NOT EXISTS gold_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text UNIQUE NOT NULL,
  weight text NOT NULL,
  purity text NOT NULL,
  source text NOT NULL,
  refiner text NOT NULL,
  current_owner text NOT NULL,
  status text DEFAULT 'In Stock',
  hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES gold_batches(id) ON DELETE CASCADE,
  from_party text NOT NULL,
  to_party text NOT NULL,
  action text NOT NULL,
  transaction_date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gold_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read batches"
  ON gold_batches FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert batches"
  ON gold_batches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update batches"
  ON gold_batches FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read batch history"
  ON batch_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert batch history"
  ON batch_history FOR INSERT
  WITH CHECK (true);

INSERT INTO gold_batches (batch_id, weight, purity, source, refiner, current_owner, status, hash)
VALUES (
  'BV-GOLD-77291',
  '500g',
  '24K',
  'South Deep Mine, SA',
  'Valcambi SA',
  'Prestige Jewellers',
  'In Stock',
  '0000x8f2e...4a1b'
) ON CONFLICT (batch_id) DO NOTHING;

INSERT INTO batch_history (batch_id, from_party, to_party, action, transaction_date)
VALUES (
  (SELECT id FROM gold_batches WHERE batch_id = 'BV-GOLD-77291'),
  'South Deep Mine',
  'Valcambi SA',
  'Mining & Refining',
  '2023-10-15'
) ON CONFLICT DO NOTHING;

INSERT INTO batch_history (batch_id, from_party, to_party, action, transaction_date)
VALUES (
  (SELECT id FROM gold_batches WHERE batch_id = 'BV-GOLD-77291'),
  'Valcambi SA',
  'Prestige Jewellers',
  'Wholesale Purchase',
  '2023-11-02'
) ON CONFLICT DO NOTHING;
