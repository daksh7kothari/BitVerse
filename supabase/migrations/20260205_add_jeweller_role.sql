-- Update participants role check constraint to include 'jeweller'
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_role_check;
ALTER TABLE participants ADD CONSTRAINT participants_role_check 
  CHECK (role IN ('refiner', 'craftsman', 'lab', 'auditor', 'admin', 'customer', 'jeweller'));

-- Add a sample jeweller participant with a fixed ID matching SimpleAuthContext
DELETE FROM participants WHERE name = 'Luxury Gems Jewellers';
INSERT INTO participants (id, name, role, permissions, active) 
VALUES ('e3cf56b8-4dc0-4081-9069-2d34d55438e0', 'Luxury Gems Jewellers', 'jeweller', '{"transfer_token": true, "view_own": true}', true)
ON CONFLICT (id) DO NOTHING;
