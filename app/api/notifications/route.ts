/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { 
  notifyNewComment, 
  notifyInvoiceSent, 
  notifyFileApproved, 
  notifyStatusChange, 
  notifyPaymentReceived,
  notifyContractSigned
} from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json({ success: false, error: 'Missing event type or payload parameters.' }, { status: 400 });
    }

    // Initialize service client to retrieve recipient emails safely if they aren't fully passed in
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let success = false;

    switch (type) {
      case 'comment': {
        // Fetch project client_email and owner email
        const { data: proj, error: projErr } = await supabase
          .from('projects')
          .select('title, client_email, users(email)')
          .eq('id', payload.projectId)
          .single();

        if (projErr || !proj) throw new Error(projErr?.message || 'Project context not found.');

        const projectTitle = proj.title;
        const ownerEmail = (proj.users as any)?.email;

        const recipientEmail = payload.senderRole === 'freelancer' ? proj.client_email : ownerEmail;
        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/portal/${payload.portalToken}`;

        if (recipientEmail) {
          success = await notifyNewComment({
            recipientEmail,
            projectTitle,
            senderRole: payload.senderRole,
            commentBody: payload.commentBody,
            portalUrl: payload.portalToken ? portalUrl : undefined,
          });
        }
        break;
      }

      case 'invoice': {
        const { data: proj, error: projErr } = await supabase
          .from('projects')
          .select('title, client_email')
          .eq('id', payload.projectId)
          .single();

        if (projErr || !proj) throw new Error(projErr?.message || 'Project context not found.');

        success = await notifyInvoiceSent({
          clientEmail: proj.client_email,
          projectTitle: proj.title,
          amount: payload.amount,
          dueDate: payload.dueDate,
          paymentUrl: payload.paymentUrl,
        });
        break;
      }

      case 'file_approved': {
        const { data: proj, error: projErr } = await supabase
          .from('projects')
          .select('title, users(email)')
          .eq('id', payload.projectId)
          .single();

        if (projErr || !proj) throw new Error(projErr?.message || 'Project context not found.');

        const ownerEmail = (proj.users as any)?.email;
        if (ownerEmail) {
          success = await notifyFileApproved({
            freelancerEmail: ownerEmail,
            projectTitle: proj.title,
            fileName: payload.fileName,
            version: payload.version,
          });
        }
        break;
      }

      case 'status_change': {
        const { data: proj, error: projErr } = await supabase
          .from('projects')
          .select('title, client_email, portal_token')
          .eq('id', payload.projectId)
          .single();

        if (projErr || !proj) throw new Error(projErr?.message || 'Project context not found.');

        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/portal/${proj.portal_token}`;

        success = await notifyStatusChange({
          clientEmail: proj.client_email,
          projectTitle: proj.title,
          newStatus: payload.newStatus,
          portalUrl,
        });
        break;
      }

      case 'payment': {
        const { data: proj, error: projErr } = await supabase
          .from('projects')
          .select('title, users(email)')
          .eq('id', payload.projectId)
          .single();

        if (projErr || !proj) throw new Error(projErr?.message || 'Project context not found.');

        const ownerEmail = (proj.users as any)?.email;
        if (ownerEmail) {
          success = await notifyPaymentReceived({
            freelancerEmail: ownerEmail,
            projectTitle: proj.title,
            amount: payload.amount,
          });
        }
        break;
      }

      case 'contract_signed': {
        const { data: proj, error: projErr } = await supabase
          .from('projects')
          .select('title, client_name, users(email)')
          .eq('id', payload.projectId)
          .single();

        if (projErr || !proj) throw new Error(projErr?.message || 'Project context not found.');

        const ownerEmail = (proj.users as any)?.email;
        if (ownerEmail) {
          success = await notifyContractSigned({
            freelancerEmail: ownerEmail,
            projectTitle: proj.title,
            clientName: proj.client_name,
            ipAddress: payload.ipAddress,
          });
        }
        break;
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown event notification type' }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[API Notification] failure:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
