-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'brief' CHECK (status IN ('brief', 'in_progress', 'review', 'delivered')),
  portal_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  description TEXT,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- 3. Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid'))
);

-- Enable RLS on milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD milestones of their projects" ON public.milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 4. Files Table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by_client BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD files of their projects" ON public.files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('freelancer', 'client')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD comments of their projects" ON public.comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = comments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  due_date DATE,
  payment_url TEXT,
  paid_at TIMESTAMPTZ
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD invoices of their projects" ON public.invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = invoices.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 7. Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  client_signed BOOLEAN NOT NULL DEFAULT false,
  signed_at TIMESTAMPTZ,
  ip_address TEXT
);

-- Enable RLS on contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD contracts of their projects" ON public.contracts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = contracts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 8. Logs Table
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs" ON public.logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own logs" ON public.logs
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- TRIGGER FOR AUTH USER REGISTRATION SYNC --
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, plan, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'free',
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- SECURE RPC CLIENT PORTAL READS --
CREATE OR REPLACE FUNCTION get_project_by_token(token UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'project', (
      SELECT json_build_object(
        'id', p.id,
        'title', p.title,
        'client_name', p.client_name,
        'client_email', p.client_email,
        'status', p.status,
        'deadline', p.deadline,
        'description', p.description,
        'created_at', p.created_at,
        'user_id', p.user_id,
        'portal_token', p.portal_token
      ) FROM projects p WHERE p.portal_token = token
    ),
    'milestones', COALESCE((
      SELECT json_agg(m) FROM milestones m 
      WHERE m.project_id = (SELECT id FROM projects WHERE portal_token = token)
      ORDER BY m.due_date ASC
    ), '[]'::jsonb),
    'files', COALESCE((
      SELECT json_agg(f) FROM files f 
      WHERE f.project_id = (SELECT id FROM projects WHERE portal_token = token)
      ORDER BY f.uploaded_at DESC
    ), '[]'::jsonb),
    'comments', COALESCE((
      SELECT json_agg(c) FROM comments c 
      WHERE c.project_id = (SELECT id FROM projects WHERE portal_token = token)
      ORDER BY c.created_at ASC
    ), '[]'::jsonb),
    'invoices', COALESCE((
      SELECT json_agg(i) FROM invoices i 
      WHERE i.project_id = (SELECT id FROM projects WHERE portal_token = token)
      ORDER BY i.due_date ASC
    ), '[]'::jsonb),
    'contract', (
      SELECT json_build_object(
        'id', con.id,
        'body', con.body,
        'client_signed', con.client_signed,
        'signed_at', con.signed_at,
        'ip_address', con.ip_address
      ) FROM contracts con
      WHERE con.project_id = (SELECT id FROM projects WHERE portal_token = token)
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- SECURE RPC CLIENT PORTAL MUTATIONS --
CREATE OR REPLACE FUNCTION add_comment_by_token(token UUID, body TEXT)
RETURNS VOID AS $$
DECLARE
  v_project_id UUID;
BEGIN
  SELECT id INTO v_project_id FROM projects WHERE portal_token = token;
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Invalid portal token';
  END IF;
  
  INSERT INTO comments (project_id, sender, body, created_at)
  VALUES (v_project_id, 'client', body, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION sign_contract_by_token(token UUID, ip_addr TEXT)
RETURNS VOID AS $$
DECLARE
  v_project_id UUID;
BEGIN
  SELECT id INTO v_project_id FROM projects WHERE portal_token = token;
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Invalid portal token';
  END IF;
  
  UPDATE contracts 
  SET client_signed = TRUE, signed_at = now(), ip_address = ip_addr
  WHERE project_id = v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_file_by_token(token UUID, file_id UUID)
RETURNS VOID AS $$
DECLARE
  v_project_id UUID;
BEGIN
  SELECT id INTO v_project_id FROM projects WHERE portal_token = token;
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Invalid portal token';
  END IF;
  
  UPDATE files 
  SET approved_by_client = TRUE 
  WHERE id = file_id AND project_id = v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════
-- ADDITIONAL TABLES & COLUMNS (MVP Phase 1)
-- ═══════════════════════════════════════════

-- 9. Webhook Logs Table (for Lemon Squeezy debugging)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'lemonsqueezy',
  event_type TEXT,
  payload JSONB,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS on webhook_logs — only server-side access via service role

-- 10. Invoice Line Items Table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD invoice items via project" ON public.invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      JOIN public.projects p ON p.id = i.project_id
      WHERE i.id = invoice_items.invoice_id
      AND p.user_id = auth.uid()
    )
  );

-- Additional user columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ls_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ls_subscription_id TEXT;

-- Additional file metadata columns
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS size_bytes BIGINT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Additional project columns
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date DATE;

-- Additional invoice columns  
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes TEXT;

-- Milestone ordering
ALTER TABLE public.milestones ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.milestones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Comment read status for notifications
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;


-- ═══════════════════════════════════════════
-- SUPABASE STORAGE BUCKET SETUP
-- ═══════════════════════════════════════════
-- Run this in the Supabase Dashboard → SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);
--
-- Storage RLS policy:
-- CREATE POLICY "Authenticated users can upload files"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Users can read their project files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);
