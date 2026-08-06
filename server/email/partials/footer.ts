import { getAppBaseUrl } from '../tokens';

/** Footer block — same tablet width as header/content (no full-bleed). */
export function emailFooter(): string {
  const base = getAppBaseUrl();
  return `<tr>
  <td style="background-color:#0f1030;padding:28px 36px 32px 36px;font-family:Arial,Helvetica,sans-serif;">
    <div style="color:#ffffff;font-size:15px;font-weight:bold;padding-bottom:8px;">SkillForge AI</div>
    <div style="color:#8f93bf;font-size:13px;line-height:20px;padding-bottom:18px;max-width:420px;">
      AI-powered curriculum generation, submission grading and role-based
      assessment analytics for modern learning teams.
    </div>
    <div style="border-top:1px solid #24264d;padding-top:18px;font-size:12px;color:#6f739c;">
      <a href="${base}/login" style="color:#a89bff;text-decoration:none;">Sign in</a>
      &nbsp;&middot;&nbsp;
      <a href="${base}/forgot-password" style="color:#a89bff;text-decoration:none;">Reset password</a>
      &nbsp;&middot;&nbsp;
      <a href="${base}/courses" style="color:#a89bff;text-decoration:none;">Courses</a>
      <div style="padding-top:12px;">&copy; ${new Date().getFullYear()} SkillForge AI. All rights reserved.</div>
      <div style="padding-top:6px;">This is an automated message — please do not reply.</div>
    </div>
  </td>
</tr>`;
}
