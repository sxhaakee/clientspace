-- ════════════════════════════════════════════════════════════
-- CLIENTSPACE — ADMIN AND SECURITY OVERHAUL (SAFE / IDEMPOTENT)
-- ════════════════════════════════════════════════════════════
-- Run this ENTIRE script in your Supabase Dashboard → SQL Editor

-- 1. ADD ROLE COLUMN IF NOT EXISTS AND PROMOTE THE ADMIN EMAIL
-- This ensures the 'role' column exists in the users table, then promotes the specified email.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

UPDATE public.users
SET role = 'admin'
WHERE email = 'gdscsxhaakee123@gmail.com';


-- 2. CREATE SECURE ROW LEVEL SECURITY (RLS) POLICIES FOR ADMIN ACCESS
-- These policies use `auth.jwt() ->> 'email'` to check the verified token email
-- directly, preventing any possible bypass or spoofing on the client side.

-- --- users TABLE ---
DROP POLICY IF EXISTS "Admin can select all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;

CREATE POLICY "Admin can select all users" ON public.users
  FOR SELECT USING (auth.jwt() ->> 'email' = 'gdscsxhaakee123@gmail.com');

CREATE POLICY "Admin can update all users" ON public.users
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'gdscsxhaakee123@gmail.com');


-- --- projects TABLE ---
DROP POLICY IF EXISTS "Admin can select all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can update all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can delete all projects" ON public.projects;

CREATE POLICY "Admin can select all projects" ON public.projects
  FOR SELECT USING (auth.jwt() ->> 'email' = 'gdscsxhaakee123@gmail.com');

CREATE POLICY "Admin can update all projects" ON public.projects
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'gdscsxhaakee123@gmail.com');

CREATE POLICY "Admin can delete all projects" ON public.projects
  FOR DELETE USING (auth.jwt() ->> 'email' = 'gdscsxhaakee123@gmail.com');


-- --- logs TABLE ---
DROP POLICY IF EXISTS "Admin can select all logs" ON public.logs;

CREATE POLICY "Admin can select all logs" ON public.logs
  FOR SELECT USING (auth.jwt() ->> 'email' = 'gdscsxhaakee123@gmail.com');


-- 3. ENSURE ALL POLICIES ARE UPDATED SUCCESSFULLY
SELECT 'Admin security schema successfully updated!' as status;
