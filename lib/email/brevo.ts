export interface EmailPayload {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

/**
 * Sends a transactional email using the Brevo API.
 */
export async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }: EmailPayload) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'notifications@clientspace.app';
  const senderName = process.env.BREVO_SENDER_NAME || 'ClientSpace';

  if (!apiKey) {
    console.log('--- [MOCK BREVO EMAIL OUTBOX] ---');
    console.log(`To: ${toName || 'Client'} <${toEmail}>`);
    console.log(`Subject: ${subject}`);
    console.log('HTML Body summary: ', htmlContent.slice(0, 150) + '...');
    console.log('---------------------------------');
    return { success: true, mock: true };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split('@')[0],
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to deliver email through Brevo.');
    }

    return { success: true, messageId: data.messageId };
  } catch (err: unknown) {
    console.error('Brevo Email sending error: ', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown SMTP failure' };
  }
}
