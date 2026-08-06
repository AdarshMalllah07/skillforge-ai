import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function isSmtpEnabled(): boolean {
  return String(process.env.SMTP_ENABLE || '').toLowerCase() === 'true';
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER_EMAIL ||
    'noreply@skillforge.ai'
  );
}

function getTransporter(): Transporter | null {
  if (!isSmtpEnabled()) return null;
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER_EMAIL;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[email] SMTP_ENABLE=true but SMTP_HOST/USER/PASS incomplete — emails will be logged only');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ sent: boolean; skipped?: boolean }> {
  const transport = getTransporter();

  if (!transport) {
    console.log('[email:dev-fallback]', {
      to: options.to,
      subject: options.subject,
      text: options.text || '(html only)',
    });
    return { sent: false, skipped: true };
  }

  await transport.sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { sent: true };
}
