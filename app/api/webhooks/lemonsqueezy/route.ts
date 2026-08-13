import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

    // 1. TIMING SAFE SIGNATURE CHECK
    if (signature && secret) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(rawBody).digest('hex');

      try {
        if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(digest, 'hex'))) {
          console.error('Timing signature check failed.');
          return NextResponse.json({ success: false, error: 'Signature mismatch' }, { status: 400 });
        }
      } catch (checkErr) {
        console.error('HMAC byte comparison failed: ', checkErr);
        return NextResponse.json({ success: false, error: 'Signature error' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    
    // Parse custom metadata passed during checkout
    const customData = payload.meta?.custom_data || {};
    const userId = customData.user_id || payload.data?.attributes?.custom_data?.user_id;
    const userEmail = payload.data?.attributes?.user_email || '';

    if (!userId) {
      console.warn('Received Lemon Squeezy event missing custom_data user_id: ', eventName);
      return NextResponse.json({ received: true, warning: 'Missing user_id' });
    }

    // 2. INITIALIZE SERVICE ROLE CLIENT (Bypasses RLS for system processes)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. EVENT ROUTING
    if (eventName === 'subscription_created') {
      const { error: updateErr } = await supabase
        .from('users')
        .update({ plan: 'pro' })
        .eq('id', userId);

      if (updateErr) throw updateErr;

      await supabase.from('logs').insert({
        event: 'subscription_created',
        user_id: userId,
        meta: { email: userEmail, payload: eventName }
      });
    } else if (eventName === 'subscription_cancelled') {
      const { error: cancelErr } = await supabase
        .from('users')
        .update({ plan: 'free' })
        .eq('id', userId);

      if (cancelErr) throw cancelErr;

      await supabase.from('logs').insert({
        event: 'subscription_cancelled',
        user_id: userId,
        meta: { email: userEmail, payload: eventName }
      });
    } else if (eventName === 'subscription_payment_success') {
      await supabase.from('logs').insert({
        event: 'invoice_paid',
        user_id: userId,
        meta: { email: userEmail, amount: payload.data?.attributes?.total }
      });
    }

    return NextResponse.json({ received: true, success: true });

  } catch (err: unknown) {
    console.error('Lemon Squeezy Webhook general failure: ', err);
    
    // As per PRD, always return 200 so Lemon Squeezy doesn't lock or spam retries
    return NextResponse.json({ received: true, success: false, error: err instanceof Error ? err.message : 'Internal server error' });
  }
}
