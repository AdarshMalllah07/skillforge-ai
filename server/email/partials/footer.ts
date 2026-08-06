import { getAppBaseUrl } from '../tokens';

/** Shared email chrome — SkillForge AI footer (600px content column, matches body). */
export function emailFooter(): string {
  const base = getAppBaseUrl();
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f1030;">
  <tr>
    <td align="center" style="padding:28px 24px 40px 24px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;color:#8f93bf;font-size:13px;line-height:20px;padding:0;">
            <div style="color:#ffffff;font-size:15px;font-weight:bold;padding-bottom:8px;">SkillForge AI</div>
            <div style="padding-bottom:18px;max-width:420px;">
              AI-powered curriculum generation, submission grading and role-based
              assessment analytics for modern learning teams.
            </div>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #24264d;padding:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6f739c;">
            <a href="${base}/login" style="color:#a89bff;text-decoration:none;">Sign in</a>
            &nbsp;&middot;&nbsp;
            <a href="${base}/forgot-password" style="color:#a89bff;text-decoration:none;">Reset password</a>
            &nbsp;&middot;&nbsp;
            <a href="${base}/courses" style="color:#a89bff;text-decoration:none;">Courses</a>
            <div style="padding-top:12px;">&copy; ${new Date().getFullYear()} SkillForge AI. All rights reserved.</div>
            <div style="padding-top:6px;color:#6f739c;">This is an automated message — please do not reply.</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}
