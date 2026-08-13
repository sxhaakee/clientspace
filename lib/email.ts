/**
 * ClientSpace Email Notification System
 * Uses Brevo (formerly Sendinblue) transactional API
 * Fallback: console.log in dev when BREVO_API_KEY is not set
 */

interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

const BRAND = {
  accent: '#C8F04B',
  dark: '#18181B',
  muted: '#71717A',
  bg: '#FAFAF8',
  border: '#E4E4E7',
};

// Brand-consistent email wrapper template
function wrapInTemplate(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background: ${BRAND.bg}; color: ${BRAND.dark}; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .header { border-bottom: 2px solid ${BRAND.dark}; padding-bottom: 16px; margin-bottom: 28px; }
    .logo { font-size: 16px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${BRAND.dark}; text-decoration: none; }
    .logo span { color: ${BRAND.accent}; background: ${BRAND.dark}; padding: 2px 6px; margin-left: 4px; }
    .body-content { font-size: 14px; line-height: 1.7; color: #3F3F46; }
    .body-content h2 { font-size: 18px; color: ${BRAND.dark}; margin: 0 0 12px; }
    .cta-btn { display: inline-block; padding: 12px 28px; background: ${BRAND.accent}; color: ${BRAND.dark}; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; margin: 20px 0; }
    .meta-box { background: #F4F4F5; border: 1px solid ${BRAND.border}; padding: 16px; margin: 20px 0; font-size: 12px; color: ${BRAND.muted}; font-family: monospace; }
    .footer { border-top: 1px solid ${BRAND.border}; padding-top: 16px; margin-top: 32px; font-size: 11px; color: ${BRAND.muted}; }
    .footer a { color: ${BRAND.muted}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clientspace.app'}" class="logo">Client<span>Space</span></a>
    </div>
    <div class="body-content">
      ${body}
    </div>
    <div class="footer">
      <p>This is an automated notification from ClientSpace. If you did not expect this email, you can safely ignore it.</p>
      <p>&copy; ${new Date().getFullYear()} ClientSpace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// Core send function — uses Brevo API or falls back to console
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log('[Email] DEV MODE — No BREVO_API_KEY set. Email payload:');
    console.log(`  To: ${payload.to}`);
    console.log(`  Subject: ${payload.subject}`);
    return true; // Don't block workflow in dev
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'ClientSpace',
          email: 'noreply@clientspace.app',
        },
        to: [{ email: payload.to }],
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        textContent: payload.textContent || '',
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error('[Email] Brevo API error:', res.status, errorData);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Email] Network error:', err);
    return false;
  }
}

// ─── Pre-built notification templates ───

export async function notifyNewComment(params: {
  recipientEmail: string;
  projectTitle: string;
  senderRole: 'freelancer' | 'client';
  commentBody: string;
  portalUrl?: string;
}) {
  const ctaUrl = params.portalUrl || process.env.NEXT_PUBLIC_APP_URL || '#';
  const senderLabel = params.senderRole === 'freelancer' ? 'Your Freelancer' : 'Your Client';

  return sendEmail({
    to: params.recipientEmail,
    subject: `New message on "${params.projectTitle}" — ClientSpace`,
    htmlContent: wrapInTemplate(`
      <h2>New Feedback Received</h2>
      <p><strong>${senderLabel}</strong> left a comment on <strong>${params.projectTitle}</strong>:</p>
      <div class="meta-box">"${params.commentBody}"</div>
      <a href="${ctaUrl}" class="cta-btn">View Conversation →</a>
    `),
  });
}

export async function notifyInvoiceSent(params: {
  clientEmail: string;
  projectTitle: string;
  amount: number;
  dueDate: string;
  paymentUrl: string;
}) {
  return sendEmail({
    to: params.clientEmail,
    subject: `Invoice for "${params.projectTitle}" — $${params.amount.toFixed(2)}`,
    htmlContent: wrapInTemplate(`
      <h2>Invoice Ready for Payment</h2>
      <p>An invoice has been created for project <strong>${params.projectTitle}</strong>.</p>
      <div class="meta-box">
        AMOUNT: $${params.amount.toFixed(2)}<br>
        DUE DATE: ${params.dueDate}<br>
        STATUS: SENT
      </div>
      <a href="${params.paymentUrl}" class="cta-btn">Pay Invoice →</a>
      <p style="font-size: 12px; color: #71717A;">Payment is processed securely via Lemon Squeezy.</p>
    `),
  });
}

export async function notifyFileApproved(params: {
  freelancerEmail: string;
  projectTitle: string;
  fileName: string;
  version: number;
}) {
  return sendEmail({
    to: params.freelancerEmail,
    subject: `File approved — "${params.fileName}" v${params.version}`,
    htmlContent: wrapInTemplate(`
      <h2>Client Approved a Deliverable</h2>
      <p>Great news! Your client approved a file on <strong>${params.projectTitle}</strong>:</p>
      <div class="meta-box">
        FILE: ${params.fileName}<br>
        VERSION: v${params.version}<br>
        STATUS: ✓ APPROVED
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/dashboard" class="cta-btn">View Project →</a>
    `),
  });
}

export async function notifyStatusChange(params: {
  clientEmail: string;
  projectTitle: string;
  newStatus: string;
  portalUrl: string;
}) {
  const statusLabels: Record<string, string> = {
    brief: 'Briefing Phase',
    in_progress: 'In Development',
    review: 'Under Review',
    delivered: 'Completed & Delivered',
  };

  return sendEmail({
    to: params.clientEmail,
    subject: `Project update — "${params.projectTitle}" moved to ${statusLabels[params.newStatus] || params.newStatus}`,
    htmlContent: wrapInTemplate(`
      <h2>Project Status Updated</h2>
      <p>Your project <strong>${params.projectTitle}</strong> has been moved to a new stage:</p>
      <div class="meta-box">
        NEW STATUS: ${(statusLabels[params.newStatus] || params.newStatus).toUpperCase()}<br>
        UPDATED: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      <a href="${params.portalUrl}" class="cta-btn">View Portal →</a>
    `),
  });
}

export async function notifyPaymentReceived(params: {
  freelancerEmail: string;
  projectTitle: string;
  amount: number;
}) {
  return sendEmail({
    to: params.freelancerEmail,
    subject: `Payment received — $${params.amount.toFixed(2)} for "${params.projectTitle}"`,
    htmlContent: wrapInTemplate(`
      <h2>Payment Confirmed 🎉</h2>
      <p>You received a payment for <strong>${params.projectTitle}</strong>:</p>
      <div class="meta-box">
        AMOUNT: $${params.amount.toFixed(2)}<br>
        STATUS: ✓ PAID<br>
        TIMESTAMP: ${new Date().toISOString()}
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/dashboard" class="cta-btn">View Dashboard →</a>
    `),
  });
}

export async function notifyContractSigned(params: {
  freelancerEmail: string;
  projectTitle: string;
  clientName: string;
  ipAddress: string;
}) {
  return sendEmail({
    to: params.freelancerEmail,
    subject: `Contract signed — "${params.projectTitle}" by ${params.clientName}`,
    htmlContent: wrapInTemplate(`
      <h2>Contract Legally Executed</h2>
      <p>Your client <strong>${params.clientName}</strong> has e-signed the agreement for <strong>${params.projectTitle}</strong>.</p>
      <div class="meta-box">
        SIGNER: ${params.clientName}<br>
        IP ADDRESS: ${params.ipAddress}<br>
        TIMESTAMP: ${new Date().toISOString()}<br>
        STATUS: ✓ LEGALLY BINDING
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/dashboard" class="cta-btn">View Project →</a>
    `),
  });
}
