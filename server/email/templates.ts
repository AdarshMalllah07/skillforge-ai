import { sendEmail } from './mailer';
import { PASSWORD_LINK_EXPIRY_MINUTES, getAppBaseUrl } from './tokens';
import { UserRole } from '../types';
import { renderEmailDocument } from './layout';
import {
  badge,
  contentShell,
  ctaButton,
  escapeHtml,
  infoCard,
  stepRow,
} from './partials/content';

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin/users',
  INSTRUCTOR: '/instructor',
  STUDENT: '/student',
  EVALUATOR: '/evaluator',
};

function roleLabel(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'INSTRUCTOR':
      return 'Instructor';
    case 'EVALUATOR':
      return 'Evaluator';
    case 'STUDENT':
    default:
      return 'Student';
  }
}

function roleSteps(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return [
        stepRow('01', 'Review the user directory', 'Create instructors, evaluators and students, and assign the right roles.'),
        stepRow('02', 'Supervise platform activity', 'Monitor courses, submissions and AI evaluation health from your admin console.'),
        stepRow('03', 'Invite your team', 'Provision accounts with a password, or send a secure setup link by email.'),
      ].join('');
    case 'INSTRUCTOR':
      return [
        stepRow('01', 'Generate or publish a course', 'Use the AI course generator or craft modules, lessons and rubrics yourself.'),
        stepRow('02', 'Open enrollments', 'Publish the course so students can join and start learning.'),
        stepRow('03', 'Grade with AI assist', 'Review submissions, apply rubric scores and share feedback quickly.'),
      ].join('');
    case 'EVALUATOR':
      return [
        stepRow('01', 'Open the evaluation queue', 'Review candidate submissions assigned to your evaluator workspace.'),
        stepRow('02', 'Use AI scoring as a baseline', 'Inspect AI rubric feedback, then finalize scores with your expertise.'),
        stepRow('03', 'Send clear feedback', 'Leave actionable notes so candidates know exactly how to improve.'),
      ].join('');
    case 'STUDENT':
    default:
      return [
        stepRow('01', 'Complete your profile', 'Add your title, bio and skill tags so AI feedback fits your background.'),
        stepRow('02', 'Explore the catalog', 'Browse published courses and enroll in your first learning track.'),
        stepRow('03', 'Submit your first assignment', 'Get instant AI feedback plus instructor or evaluator review.'),
      ].join('');
  }
}

function welcomeContent(params: { name: string; role: UserRole; dashboardUrl: string }): string {
  return contentShell(`
    <tr>
      <td style="padding:36px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;">
        ${badge('Welcome aboard', '#e7f7ee', '#177a4a')}
        <h1 style="margin:18px 0 10px 0;color:#12132e;font-size:24px;line-height:32px;">Welcome to SkillForge AI, ${escapeHtml(params.name)}</h1>
        <p style="margin:0;color:#5a5f80;font-size:15px;line-height:24px;">
          Your account is ready and you've been assigned the
          <strong style="color:#12132e;">${escapeHtml(roleLabel(params.role))}</strong> role. Here's how to get
          productive in the next five minutes.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${roleSteps(params.role)}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 36px 36px 36px;">
        ${ctaButton(params.dashboardUrl, 'Open my dashboard')}
      </td>
    </tr>
  `);
}

function setupPasswordContent(params: {
  name: string;
  role: UserRole;
  setupUrl: string;
}): string {
  return contentShell(`
    <tr>
      <td style="padding:36px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;">
        ${badge('Account invite', '#efeaff', '#5b3ee8')}
        <h1 style="margin:18px 0 10px 0;color:#12132e;font-size:24px;line-height:32px;">Set up your password</h1>
        <p style="margin:0;color:#5a5f80;font-size:15px;line-height:24px;">
          Hi ${escapeHtml(params.name)}, an administrator created a
          <strong style="color:#12132e;">${escapeHtml(roleLabel(params.role))}</strong>
          account for you on SkillForge AI. Activate it by choosing a password.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 36px 0 36px;">
        ${ctaButton(params.setupUrl, 'Set up your password')}
      </td>
    </tr>
    <tr>
      <td style="padding:22px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;color:#5a5f80;font-size:13px;line-height:21px;">
        This link expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes. If the button doesn't work,
        copy and paste this URL into your browser:<br />
        <a href="${escapeHtml(params.setupUrl)}" style="color:#5b3ee8;word-break:break-all;">${escapeHtml(params.setupUrl)}</a>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 36px 36px 36px;">
        ${infoCard(
          `Once your password is set, sign in and open your <strong style="color:#12132e;">${escapeHtml(roleLabel(params.role))}</strong> dashboard to get started.`,
          '#f7f7fd',
          '#e6e7f2',
          '#5a5f80'
        )}
      </td>
    </tr>
  `);
}

function resetPasswordContent(params: {
  name: string;
  resetUrl: string;
}): string {
  return contentShell(`
    <tr>
      <td style="padding:36px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;">
        ${badge('Password reset', '#fff0e6', '#c2560c')}
        <h1 style="margin:18px 0 10px 0;color:#12132e;font-size:24px;line-height:32px;">Reset your password</h1>
        <p style="margin:0;color:#5a5f80;font-size:15px;line-height:24px;">
          Hi ${escapeHtml(params.name)}, we received a request to reset the password for your
          SkillForge AI account. Choose a new one using the button below.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 36px 0 36px;">
        ${ctaButton(params.resetUrl, 'Choose a new password')}
      </td>
    </tr>
    <tr>
      <td style="padding:22px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;color:#5a5f80;font-size:13px;line-height:21px;">
        This link expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes. If the button doesn't work,
        copy and paste this URL into your browser:<br />
        <a href="${escapeHtml(params.resetUrl)}" style="color:#5b3ee8;word-break:break-all;">${escapeHtml(params.resetUrl)}</a>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 36px 36px 36px;">
        ${infoCard(
          `If you didn't request a reset, no action is needed &mdash; your current password remains active.`,
          '#fdf6f2',
          '#f4dfd1',
          '#8a5a3b'
        )}
      </td>
    </tr>
  `);
}

function passwordChangedContent(params: { name: string; loginUrl: string }): string {
  return contentShell(`
    <tr>
      <td style="padding:36px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;">
        ${badge('Security update', '#e7f7ee', '#177a4a')}
        <h1 style="margin:18px 0 10px 0;color:#12132e;font-size:24px;line-height:32px;">Password updated</h1>
        <p style="margin:0;color:#5a5f80;font-size:15px;line-height:24px;">
          Hi ${escapeHtml(params.name)}, your SkillForge AI password was changed successfully.
          You can sign in with your new credentials anytime.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 36px 0 36px;">
        ${ctaButton(params.loginUrl, 'Sign in')}
      </td>
    </tr>
    <tr>
      <td style="padding:24px 36px 36px 36px;">
        ${infoCard(
          `If you did not make this change, reset your password immediately and contact your administrator.`,
          '#fdf6f2',
          '#f4dfd1',
          '#8a5a3b'
        )}
      </td>
    </tr>
  `);
}

function enrollmentContent(params: {
  name: string;
  courseTitle: string;
  courseUrl: string;
}): string {
  return contentShell(`
    <tr>
      <td style="padding:36px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;">
        ${badge('Enrollment confirmed', '#efeaff', '#5b3ee8')}
        <h1 style="margin:18px 0 10px 0;color:#12132e;font-size:24px;line-height:32px;">You're enrolled</h1>
        <p style="margin:0;color:#5a5f80;font-size:15px;line-height:24px;">
          Hi ${escapeHtml(params.name)}, you are now enrolled in
          <strong style="color:#12132e;">${escapeHtml(params.courseTitle)}</strong>.
          Open the course to start lessons and track assignments.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 36px 36px 36px;">
        ${ctaButton(params.courseUrl, 'Open course')}
      </td>
    </tr>
  `);
}

function gradedContent(params: {
  name: string;
  courseTitle: string;
  score?: number | null;
  submissionsUrl: string;
}): string {
  const scoreBlock =
    params.score !== undefined && params.score !== null
      ? `<tr>
          <td style="padding:22px 36px 0 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f1030;border-radius:12px;">
              <tr>
                <td align="center" style="padding:18px;font-family:Arial,Helvetica,sans-serif;color:#8f93bf;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Final score</td>
              </tr>
              <tr>
                <td align="center" style="padding:0 18px 20px 18px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:28px;font-weight:bold;">${escapeHtml(String(params.score))}</td>
              </tr>
            </table>
          </td>
        </tr>`
      : '';

  return contentShell(`
    <tr>
      <td style="padding:36px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;">
        ${badge('Submission graded', '#e7f7ee', '#177a4a')}
        <h1 style="margin:18px 0 10px 0;color:#12132e;font-size:24px;line-height:32px;">Your work was graded</h1>
        <p style="margin:0;color:#5a5f80;font-size:15px;line-height:24px;">
          Hi ${escapeHtml(params.name)}, your submission for
          <strong style="color:#12132e;">${escapeHtml(params.courseTitle)}</strong>
          has been graded. Open SkillForge AI to review detailed feedback.
        </p>
      </td>
    </tr>
    ${scoreBlock}
    <tr>
      <td style="padding:26px 36px 36px 36px;">
        ${ctaButton(params.submissionsUrl, 'View feedback')}
      </td>
    </tr>
  `);
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  role: UserRole;
}): Promise<void> {
  const dashboardUrl = `${getAppBaseUrl()}${ROLE_HOME[params.role]}`;
  const subject = `Welcome to SkillForge AI — ${roleLabel(params.role)} account ready`;
  const html = renderEmailDocument({
    title: subject,
    preheader: `Your ${roleLabel(params.role)} account on SkillForge AI is ready.`,
    contentHtml: welcomeContent({
      name: params.name,
      role: params.role,
      dashboardUrl,
    }),
  });
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, welcome to SkillForge AI as a ${params.role}. Open your dashboard: ${dashboardUrl}`,
  });
}

export async function sendSetupPasswordInviteEmail(params: {
  to: string;
  name: string;
  role: UserRole;
  setupUrl: string;
}): Promise<void> {
  const subject = 'Set up your SkillForge AI account';
  const html = renderEmailDocument({
    title: subject,
    preheader: `Activate your ${roleLabel(params.role)} account — link expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes.`,
    contentHtml: setupPasswordContent(params),
  });
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
}) {
  const subject = 'Reset your SkillForge AI password';
  const html = renderEmailDocument({
    title: subject,
    preheader: `Password reset link — expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes.`,
    contentHtml: resetPasswordContent(params),
  });
  return sendEmail({
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
  const html = renderEmailDocument({
    title: subject,
    preheader: 'Your password was updated successfully.',
    contentHtml: passwordChangedContent({ name: params.name, loginUrl }),
  });
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
  const html = renderEmailDocument({
    title: subject,
    preheader: `You're enrolled in ${params.courseTitle}.`,
    contentHtml: enrollmentContent(params),
  });
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
  const subject = `Graded: ${params.courseTitle}`;
  const html = renderEmailDocument({
    title: subject,
    preheader: `Your submission for ${params.courseTitle} was graded.`,
    contentHtml: gradedContent(params),
  });
  await sendEmail({
    to: params.to,
    subject,
    html,
    text: `Hi ${params.name}, your submission for ${params.courseTitle} was graded${
      params.score != null ? ` (score: ${params.score})` : ''
    }. View: ${params.submissionsUrl}`,
  });
}
