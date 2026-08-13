import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, NextRequest } from 'next/server';

// GET /api/portal?token=xxx — fetch all portal data
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing portal token' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch project by portal_token (bypass RLS since this is server-side)
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('*, users(full_name)')
    .eq('portal_token', token)
    .maybeSingle();

  if (projErr || !project) {
    return NextResponse.json({ error: 'Invalid portal token' }, { status: 404 });
  }

  // Fetch all related data in parallel
  const [milestonesRes, filesRes, commentsRes, invoicesRes, contractRes, logsRes] = await Promise.all([
    supabase.from('milestones').select('*').eq('project_id', project.id).order('due_date', { ascending: true }),
    supabase.from('files').select('*').eq('project_id', project.id).order('uploaded_at', { ascending: false }),
    supabase.from('comments').select('*').eq('project_id', project.id).order('created_at', { ascending: true }),
    supabase.from('invoices').select('*').eq('project_id', project.id).order('due_date', { ascending: true }),
    supabase.from('contracts').select('*').eq('project_id', project.id).maybeSingle(),
    supabase.from('logs').select('*').eq('project_id', project.id).order('created_at', { ascending: false }),
  ]);

  return NextResponse.json({
    project,
    milestones: milestonesRes.data || [],
    files: filesRes.data || [],
    comments: commentsRes.data || [],
    invoices: invoicesRes.data || [],
    contract: contractRes.data || null,
    logs: logsRes.data || [],
  });
}

// POST /api/portal — handle mutations (comment, approve, sign, submit_feedback)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, token, ...params } = body;

  if (!token || !action) {
    return NextResponse.json({ error: 'Missing token or action' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Validate token → get project
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('*, users(full_name)')
    .eq('portal_token', token)
    .maybeSingle();

  if (projErr || !project) {
    return NextResponse.json({ error: 'Invalid portal token' }, { status: 404 });
  }

  try {
    const freelancerName = (project.users as any)?.full_name || 'Freelancer';
    const clientName = project.client_name || 'Client';

    if (action === 'add_comment') {
      const { error } = await supabase.from('comments').insert({
        project_id: project.id,
        sender: 'client',
        body: params.body,
      });
      if (error) throw error;

      await supabase.from('logs').insert({
        event: 'comment_added',
        project_id: project.id,
        meta: { 
          sender: 'client',
          sender_name: clientName,
          text: `${clientName} left a message`
        },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'approve_file') {
      const { error } = await supabase
        .from('files')
        .update({ approved_by_client: true })
        .eq('id', params.file_id)
        .eq('project_id', project.id);
      if (error) throw error;

      // Fetch file name for log
      const { data: fileData } = await supabase.from('files').select('name').eq('id', params.file_id).single();

      await supabase.from('logs').insert({
        event: 'file_approved',
        project_id: project.id,
        meta: {
          filename: fileData?.name || 'File',
          text: `${clientName} approved deliverable: ${fileData?.name || 'File'}`
        }
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'sign_contract') {
      const { error } = await supabase
        .from('contracts')
        .update({
          client_signed: true,
          signed_at: new Date().toISOString(),
          ip_address: params.ip_addr || '0.0.0.0',
        })
        .eq('project_id', project.id);
      if (error) throw error;

      await supabase.from('logs').insert({
        event: 'contract_signed',
        project_id: project.id,
        meta: {
          text: `${clientName} e-signed the service agreement`
        }
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'submit_feedback') {
      const { rating, feedback } = params;
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
      }

      const { error } = await supabase
        .from('projects')
        .update({
          client_rating: rating,
          client_feedback: feedback || '',
          status: 'delivered',
        })
        .eq('id', project.id);
      if (error) throw error;

      await supabase.from('logs').insert({
        event: 'rating_given',
        project_id: project.id,
        meta: {
          rating,
          feedback,
          text: `${clientName} completed the project review and rated it ${rating} stars`
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Portal mutation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
