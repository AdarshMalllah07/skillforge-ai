import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '@/server/logger';

let transporter: Transporter | null = null;
let transporterVerified = false;

function isSmtpEnabled(): boolean {
  return String(process.env.SMTP_ENABLE || '').toLowerCase() === 'true';
}

function cleanEnv(value?: string | null): string {
  if (!value) return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function getSmtpConfig() {
  const host = cleanEnv(process.env.SMTP_HOST);
  const port = Number(cleanEnv(process.env.SMTP_PORT) || '587');
  const user = cleanEnv(process.env.SMTP_USER_EMAIL);
  const pass = cleanEnv(process.env.SMTP_PASS);
  const from = cleanEnv(process.env.SMTP_FROM) || user || 'noreply@skillforge.ai';

  return { host, port, user, pass, from, enabled: isSmtpEnabled() };
}

function getFromAddress(): string {
  return getSmtpConfig().from;
}

async function getTransporter(): Promise<Transporter> {
  const config = getSmtpConfig();

  logger.email('Resolving SMTP transporter', {
    enabled: config.enabled,
    host: config.host,
    port: config.port,
    user: config.user,
    passConfigured: Boolean(config.pass),
    passLength: config.pass.length,
  });

  if (!config.enabled) {
    throw new Error('Email not sent: SMTP_ENABLE is not true');
  }

  if (!config.host || !config.user || !config.pass) {
    throw new Error(
      'Email not sent: SMTP config incomplete. Set SMTP_HOST, SMTP_USER_EMAIL, and SMTP_PASS'
    );
  }

  if (transporter && transporterVerified) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      minVersion: 'TLSv1.2',
    },
  });

  try {
    logger.email('Verifying SMTP connection', {
      host: config.host,
      port: config.port,
      user: config.user,
    });
    await transporter.verify();
    transporterVerified = true;
    logger.email('SMTP connection verified successfully', {
      host: config.host,
      port: config.port,
      user: config.user,
    });
  } catch (err) {
    transporterVerified = false;
    transporter = null;
    logger.emailError('SMTP verification failed', {
      host: config.host,
      port: config.port,
      user: config.user,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ sent: boolean; messageId?: string; response?: string }> {
  const started = Date.now();
  logger.email('sendEmail called', {
    subject: options.subject,
    hasText: Boolean(options.text),
  });

  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: getFromAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.email('Email sent successfully', {
      subject: options.subject,
      messageId: info.messageId,
      acceptedCount: Array.isArray(info.accepted) ? info.accepted.length : 0,
      rejectedCount: Array.isArray(info.rejected) ? info.rejected.length : 0,
      durationMs: Date.now() - started,
    });

    return { sent: true, messageId: info.messageId, response: info.response };
  } catch (err) {
    logger.emailError('Email send failed', {
      subject: options.subject,
      durationMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    });
    transporter = null;
    transporterVerified = false;
    throw err;
  }
}
