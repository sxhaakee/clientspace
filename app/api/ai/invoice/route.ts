import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // 1. Get authenticated user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    // 2. Query plan status (Pro gate)
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

    // 3. Parse input
    const { what_was_done } = await request.json();
    if (!what_was_done) {
      return NextResponse.json({ success: false, error: 'Please describe the tasks completed.' }, { status: 400 });
    }

    // 4. Call Mistral API
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      // Mock line item response
      return NextResponse.json({
        success: true,
        data: [
          { description: 'Design Sprint: Wireframes and Layout Mockups', amount: 650 },
          { description: 'Interactive Prototypes & Client Portal Config', amount: 300 },
          { description: 'Revision cycles (3 rounds resolved)', amount: 150 }
        ]
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
          content: `Translate the following plain text description of work done into a structured JSON list of invoice line items with suggested prices.
          Text: "${what_was_done}"
          
          Respond ONLY with a valid JSON array. Do not write any conversational text or explanation. 
          Format: [{"description": "Item name", "amount": 100}]`
        }]
      })
    });

    const mistralData = await response.json();
    if (!response.ok) {
      throw new Error(mistralData.message || 'Mistral connection error');
    }

    const textResult = mistralData.choices?.[0]?.message?.content || '';
    
    // Parse the JSON array out of the text
    const jsonStart = textResult.indexOf('[');
    const jsonEnd = textResult.lastIndexOf(']') + 1;
    const jsonString = textResult.substring(jsonStart, jsonEnd);
    
    const parsedData = JSON.parse(jsonString);

    return NextResponse.json({
      success: true,
      data: parsedData
    });

  } catch (err: unknown) {
    console.error('AI Invoice route error: ', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
