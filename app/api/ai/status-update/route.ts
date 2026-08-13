import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // 1. Authenticate user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    // 2. Check Pro status
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.plan !== 'pro' && profile.plan !== 'agency')) {
      return NextResponse.json(
        { success: false, error: 'Pro tier required.', upgradeRequired: true }, 
        { status: 403 }
      );
    }

    // 3. Parse and fetch project details
    const { project_id } = await request.json();
    if (!project_id) {
      return NextResponse.json({ success: false, error: 'project_id is required' }, { status: 400 });
    }

    const { data: project } = await supabase.from('projects').select('*').eq('id', project_id).single();
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    const { data: files } = await supabase.from('files').select('*').eq('project_id', project_id).limit(3);
    const { data: milestones } = await supabase.from('milestones').select('*').eq('project_id', project_id).limit(4);

    const uploadedFilesString = (files || []).map(f => `File: ${f.name} (v${f.version})`).join('\n');
    const milestonesString = (milestones || []).map(m => `Milestone: ${m.title} - Status: ${m.status}`).join('\n');

    // 4. Call Mistral API
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      // Mock progress email
      return NextResponse.json({
        success: true,
        data: `Subject: Project Update: ${project.title} 🚀\n\nHi ${project.client_name},\n\nI hope you're having a wonderful week. Here is a brief summary of my progress on **${project.title}**:\n\n* **Status:** We are currently in the **${project.status.toUpperCase()}** stage.\n* **Recent Deliverables:** I've uploaded the latest revisions to your secure ClientSpace portal.\n* **Milestones Checked:** We are on track for upcoming timelines.\n\nYou can review all files, approve versions, and leave feedback anytime directly in your workspace portal:\n[Click here to open your Project Portal](${process.env.NEXT_PUBLIC_APP_URL || 'https://clientspace.app'}/portal/${project.portal_token})\n\nTalk soon,\n${user.user_metadata?.full_name || 'Your Freelancer'}`
      });
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Write a elegant, premium, and friendly weekly project update email from a professional freelancer to their client.
          Project Name: ${project.title}
          Client Name: ${project.client_name}
          Current Stage: ${project.status}
          
          Recent Activity Data:
          ${uploadedFilesString || 'No files uploaded recently.'}
          ${milestonesString || 'No milestones configured yet.'}
          
          Keep the style Swiss-calm, direct, and reassuring. Do not sound startup-cute or corporate-stiff. Conclude with a prompt to review the deliverables inside their secure portal link. Output the Subject line first, followed by the email body.`
        }]
      })
    });

    const mistralData = await response.json();
    if (!response.ok) {
      throw new Error(mistralData.message || 'Mistral connection error');
    }

    const textResult = mistralData.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: textResult
    });

  } catch (err: unknown) {
    console.error('AI Status Update error: ', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
