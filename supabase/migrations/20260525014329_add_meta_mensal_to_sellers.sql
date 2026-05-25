/*
  # Add monthly target to sellers and enhance clients table

  1. Changes to sellers
    - Add monthly_target column for sales goal tracking
    - Add ticket_medio (average ticket) tracking via view

  2. Changes to clients
    - Add ticket_medio column for average ticket value
    - Add potential_recovery column for recovery opportunity value
    - Add funnel_stage column to track client funnel position
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'monthly_target'
  ) THEN
    ALTER TABLE sellers ADD COLUMN monthly_target numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'ticket_medio'
  ) THEN
    ALTER TABLE clients ADD COLUMN ticket_medio numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'potential_recovery'
  ) THEN
    ALTER TABLE clients ADD COLUMN potential_recovery numeric DEFAULT 0;
  END IF;
END $$;
