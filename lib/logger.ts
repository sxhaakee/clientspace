import { createClient } from '@/lib/supabase/client';

type LogEvent =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'file_uploaded'
  | 'file_approved'
  | 'invoice_created'
  | 'invoice_sent'
  | 'invoice_paid'
  | 'milestone_completed'
  | 'comment_posted'
  | 'contract_signed'
  | 'portal_viewed'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'payment_received'
  | 'email_sent';

export async function logEvent(
  event: LogEvent,
  userId: string,
  projectId?: string,
  meta?: Record<string, unknown>
) {
  try {
    const supabase = createClient();
    await supabase.from('logs').insert({
      event,
      user_id: userId,
      project_id: projectId || null,
      meta: meta || {},
    });
  } catch (err) {
    // Never crash the app for a logging failure
    console.error('[Logger] Failed to log event:', event, err);
  }
}
