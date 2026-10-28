-- 003_seed_test_user.sql
-- Create a test user for development

INSERT INTO users (id, email, password_hash, name, role, status) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'test@findly.ug', NULL, 'Test User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;