import { sendEmail } from './mailer';
import { PASSWORD_LINK_EXPIRY_MINUTES, getAppBaseUrl } from './tokens';
import { UserRole } from '../types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#312e81);padding:24px 28px;">
            <div style="color:#a5b4fc;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">SkillForge AI</div>
            <div style="color:#ffffff;font-size:20px;font-weight:800;margin-top:6px;">${escapeHtml(title)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;color:#334155;font-size:14px;line-height:1.6;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 24px;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;">
            House of EdTech · SkillForge AI<br/>
            This is an automated message — please do not reply.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;font-size:13px;">
      ${escapeHtml(label)}
    </a>
  </p>
  <p style="font-size:12px;color:#64748b;word-break:break-all;">Or copy this link:<br/>${escapeHtml(href)}</p>`;
}

function roleLabel(role: UserRole): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  role: UserRole;
}): Promise<void> {
  const loginUrl = `${getAppBaseUrl()}/login`;
  const subject = 'Welcome to SkillForge AI';
  const html = layout(
    'Welcome aboard!',
    `<p>Hi ${escapeHtml(params.name)},</p>
     <p>Your <strong>${escapeHtml(roleLabel(params.role))}</strong> account on SkillForge AI is ready.</p>
     <p>Sign in anytime to access your dashboard, courses, and AI-powered learning tools.</p>
     ${ctaButton(loginUrl, 'Sign In to SkillForge AI')}`
  );
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, welcome to SkillForge AI as a ${params.role}. Sign in: ${loginUrl}`,
  });
}

export async function sendSetupPasswordInviteEmail(params: {
  to: string;
  name: string;
  role: UserRole;
  setupUrl: string;
}): Promise<void> {
  const subject = 'Set up your SkillForge AI account';
  const html = layout(
    'Set up your password',
    `<p>Hi ${escapeHtml(params.name)},</p>
     <p>An administrator created a <strong>${escapeHtml(roleLabel(params.role))}</strong> account for you on SkillForge AI.</p>
     <p>Use the button below to choose your password and activate your account. This link expires in <strong>${PASSWORD_LINK_EXPIRY_MINUTES} minutes</strong>.</p>
     ${ctaButton(params.setupUrl, 'Set Up Your Password')}`
  );
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, set up your SkillForge AI ${params.role} account password: ${params.setupUrl} (expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes)`,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  const subject = 'Reset your SkillForge AI password';
  const html = layout(
    'Password reset request',
    `<p>Hi ${escapeHtml(params.name)},</p>
     <p>We received a request to reset your SkillForge AI password.</p>
     <p>This link expires in <strong>${PASSWORD_LINK_EXPIRY_MINUTES} minutes</strong>. If you did not request this, you can safely ignore this email.</p>
     ${ctaButton(params.resetUrl, 'Reset Password')}`
  );
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, reset your password: ${params.resetUrl} (expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes)`,
  });
}

export async function sendPasswordChangedEmail(params: {
  to: string;
  name: string;
}): Promise<void> {
  const loginUrl = `${getAppBaseUrl()}/login`;
  const subject = 'Your SkillForge AI password was changed';
  const html = layout(
    'Password updated',
    `<p>Hi ${escapeHtml(params.name)},</p>
     <p>Your SkillForge AI password was changed successfully.</p>
     <p>If you did not make this change, contact your administrator immediately and reset your password.</p>
     ${ctaButton(loginUrl, 'Sign In')}`
  );
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, your SkillForge AI password was changed. Sign in: ${loginUrl}`,
  });
}

export async function sendEnrollmentEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
  courseUrl: string;
}): Promise<void> {
  const subject = `Enrolled: ${params.courseTitle}`;
  const html = layout(
    'Course enrollment confirmed',
    `<p>Hi ${escapeHtml(params.name)},</p>
     <p>You are now enrolled in <strong>${escapeHtml(params.courseTitle)}</strong>.</p>
     <p>Open the course to start lessons and track assignments.</p>
     ${ctaButton(params.courseUrl, 'Open Course')}`
  );
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, you enrolled in ${params.courseTitle}. Open: ${params.courseUrl}`,
  });
}

export async function sendSubmissionGradedEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
  score?: number | null;
  submissionsUrl: string;
}): Promise<void> {
  const scoreLine =
    params.score !== undefined && params.score !== null
      ? `<p>Final score: <strong>${escapeHtml(String(params.score))}</strong></p>`
      : '';
  const subject = `Graded: ${params.courseTitle}`;
  const html = layout(
    'Your submission was graded',
    `<p>Hi ${escapeHtml(params.name)},</p>
     <p>Your submission for <strong>${escapeHtml(params.courseTitle)}</strong> has been graded.</p>
     ${scoreLine}
     ${ctaButton(params.submissionsUrl, 'View Feedback')}`
  );
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, your submission for ${params.courseTitle} was graded${
      params.score != null ? ` (score: ${params.score})` : ''
    }. View: ${params.submissionsUrl}`,
  });
}
