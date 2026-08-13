-- ═══════════════════════════════════════════
-- CLIENTSPACE — RLS FIX (SAFE / IDEMPOTENT)
-- ═══════════════════════════════════════════
-- Paste this ENTIRE script in Supabase → SQL Editor → Run


-- 1. FILES
DROP POLICY IF EXISTS "Users can CRUD files of their projects" ON public.files;
DROP POLICY IF EXISTS "files_select" ON public.files;
DROP POLICY IF EXISTS "files_insert" ON public.files;
DROP POLICY IF EXISTS "files_update" ON public.files;
DROP POLICY IF EXISTS "files_delete" ON public.files;

CREATE POLICY "files_select" ON public.files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "files_insert" ON public.files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "files_update" ON public.files FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "files_delete" ON public.files FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid())
);


-- 2. LOGS (allow any insert, even from anon/portal)
DROP POLICY IF EXISTS "Users can view their own logs" ON public.logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.logs;
DROP POLICY IF EXISTS "logs_insert" ON public.logs;
DROP POLICY IF EXISTS "logs_select" ON public.logs;

CREATE POLICY "logs_insert" ON public.logs FOR INSERT WITH CHECK (true);
CREATE POLICY "logs_select" ON public.logs FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.projects WHERE projects.id = logs.project_id AND projects.user_id = auth.uid())
);


-- 3. COMMENTS
DROP POLICY IF EXISTS "Users can CRUD comments of their projects" ON public.comments;
DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_update" ON public.comments;
DROP POLICY IF EXISTS "comments_delete" ON public.comments;

CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = comments.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = comments.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "comments_update" ON public.comments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = comments.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = comments.project_id AND projects.user_id = auth.uid())
);


-- 4. MILESTONES
DROP POLICY IF EXISTS "Users can CRUD milestones of their projects" ON public.milestones;
DROP POLICY IF EXISTS "milestones_select" ON public.milestones;
DROP POLICY IF EXISTS "milestones_insert" ON public.milestones;
DROP POLICY IF EXISTS "milestones_update" ON public.milestones;
DROP POLICY IF EXISTS "milestones_delete" ON public.milestones;

CREATE POLICY "milestones_select" ON public.milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "milestones_insert" ON public.milestones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "milestones_update" ON public.milestones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "milestones_delete" ON public.milestones FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid())
);


-- 5. INVOICES
DROP POLICY IF EXISTS "Users can CRUD invoices of their projects" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;

CREATE POLICY "invoices_select" ON public.invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid())
);


-- 6. CONTRACTS
DROP POLICY IF EXISTS "Users can CRUD contracts of their projects" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete" ON public.contracts;

CREATE POLICY "contracts_select" ON public.contracts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = contracts.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "contracts_insert" ON public.contracts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = contracts.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "contracts_update" ON public.contracts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = contracts.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "contracts_delete" ON public.contracts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = contracts.project_id AND projects.user_id = auth.uid())
);


-- 7. GRANT PORTAL RPC ACCESS TO ANON + AUTHENTICATED
GRANT EXECUTE ON FUNCTION get_project_by_token(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_project_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_comment_by_token(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION add_comment_by_token(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION sign_contract_by_token(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION sign_contract_by_token(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_file_by_token(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION approve_file_by_token(UUID, UUID) TO authenticated;


-- 8. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "auth_upload_deliverables" ON storage.objects;
DROP POLICY IF EXISTS "auth_read_deliverables" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_deliverables" ON storage.objects;

CREATE POLICY "auth_upload_deliverables" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'deliverables' AND auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_deliverables" ON storage.objects
  FOR SELECT USING (bucket_id = 'deliverables');
CREATE POLICY "auth_update_deliverables" ON storage.objects
  FOR UPDATE USING (bucket_id = 'deliverables' AND auth.uid() IS NOT NULL);


-- 9. PROJECTS RATING & FEEDBACK COLUMNS
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_rating INT CHECK (client_rating >= 1 AND client_rating <= 5);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_feedback TEXT;

-- DONE ✅
