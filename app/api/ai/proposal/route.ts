import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // 1. Get authenticated user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized user context.' }, { status: 401 });
    }

    // 2. Query plan status (Pro gate)
    const { data: profile, error: dbErr } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (dbErr || !profile) {
      return NextResponse.json({ success: false, error: 'User profile not found.' }, { status: 404 });
    }

    if (profile.plan !== 'pro' && profile.plan !== 'agency') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Upgrade required. AI features are exclusive to the Pro & Agency tiers.',
          upgradeRequired: true 
        }, 
        { status: 403 }
      );
    }

    // 3. Parse input
    const { project_type, client_name, budget, scope_description } = await request.json();
    if (!project_type || !client_name || !budget || !scope_description) {
      return NextResponse.json({ success: false, error: 'Missing input fields.' }, { status: 400 });
    }

    // 4. Call Mistral API
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      // Return highly helpful mock response if key is missing during initialization
      return NextResponse.json({
        success: true,
        data: `## Professional Services Proposal\n\n**Prepared for:** ${client_name}\n**Budget Outline:** $${budget}\n**Focus:** ${project_type}\n\n### 1. Project Objectives\nTo design and deploy a state-of-the-art solution that aligns with the Client's business values, leveraging elegant visuals and brutalist clean UI rules.\n\n### 2. Scope & Focus Area\n* **Research & Moodboard Alignment:** Establish the creative direction.\n* **Execution Phase:** Develop high-end assets tailored specifically to the scope:\n  > *"${scope_description}"*\n* **Versioned Client Review:** Regular checkpoints in the portal for complete visual alignment.\n\n### 3. Estimated Payout Milestones\n* **Milestone 1:** 50% Deposit upfront (Prior to kickoff)\n* **Milestone 2:** 50% Final settlement upon completion\n\n*Draft generated via ClientSpace AI. Configure your MISTRAL_API_KEY to fetch live responses.*`
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
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Write a high-end, extremely professional and persuasive freelance project proposal in Markdown.
          Project Type: ${project_type}
          Client Name: ${client_name}
          Budget: $${budget}
          Scope details: ${scope_description}
          Keep the style sophisticated, calm, and trustworthy. Use clear headers and bullets. Include a suggested timeline split into two payment milestones.`
        }]
      })
    });

    const mistralData = await response.json();
    if (!response.ok) {
      throw new Error(mistralData.message || 'Error communicating with Mistral');
    }

    const textResult = mistralData.choices?.[0]?.message?.content || '';
    
    return NextResponse.json({
      success: true,
      data: textResult
    });

  } catch (err: unknown) {
    console.error('Proposal route error: ', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
