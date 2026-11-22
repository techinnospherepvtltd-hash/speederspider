-- =============================================================================
-- SpeederSpider Permissions & Owner Profile Migration
-- Run this in Supabase SQL Editor
-- =============================================================================

-- 1. Grant table access to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Link owner profile for the auth user (created via Supabase Auth):
INSERT INTO public.profiles (id, role, full_name, email, is_active)
SELECT 
    id, 
    'owner', 
    'SpeederSpider Owner', 
    email, 
    true
FROM auth.users 
WHERE email = 'owner@speederspider.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'owner', is_active = true;
