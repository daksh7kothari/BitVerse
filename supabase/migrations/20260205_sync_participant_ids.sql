-- Reset and sync participants table with Mock IDs from SimpleAuthContext.jsx
-- This ensures that 'req.user.id' from the mock tokens correctly maps to existing records.

-- 1. Temporarily disable foreign key checks or handle dependencies
-- (Supabase/Postgres doesn't have a simple DISABLE, so we'll just update or re-insert carefully)

-- 2. Delete existing participants to avoid conflicts (they are likely auto-generated)
DELETE FROM participants;

-- 3. Insert specific participants with fixed UUIDs
INSERT INTO participants (id, name, role, permissions, active) VALUES
('9f53546e-67a2-4d0e-bd43-131479a64c62', 'Gold Refinery Inc', 'refiner', '{"mint_token": true, "merge_token": true, "transfer_token": true, "view_own": true}', true),
('b3cf56b8-4dc0-4081-9069-2d34d55438e0', 'Master Craftsman Ltd', 'craftsman', '{"split_token": true, "merge_token": true, "log_wastage": true, "transfer_token": true, "create_product": true, "view_own": true}', true),
('3fb85466-33f9-4ca8-a995-2bf27528e808', 'Quality Lab Services', 'lab', '{"approve_wastage": true, "view_all": true}', true),
('505377c0-cb91-474f-9806-fc305ddc0078', 'BitVerse Admin', 'admin', '{"mint_token": true, "split_token": true, "merge_token": true, "transfer_token": true, "approve_wastage": true, "update_thresholds": true, "view_all": true, "create_product": true}', true),
('e3cf56b8-4dc0-4081-9069-2d34d55438e0', 'Luxury Gems Jewellers', 'jeweller', '{"transfer_token": true, "view_own": true}', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;
