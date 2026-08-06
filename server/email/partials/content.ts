/** Shared helpers for SkillForge email content cards (600px, matches header/footer). */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function contentShell(innerRowsHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5fb;">
  <tr>
    <td align="center" style="padding:8px 24px 28px 24px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border:1px solid #e6e7f2;border-radius:14px;">
        ${innerRowsHtml}
      </table>
    </td>
  </tr>
</table>`;
}

export function badge(label: string, bg: string, color: string): string {
  return `<div style="display:inline-block;padding:5px 11px;border-radius:999px;background-color:${bg};color:${color};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(label)}</div>`;
}

export function ctaButton(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background-color:#6d4aff;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:10px;">${escapeHtml(label)}</a>`;
}

export function infoCard(html: string, bg = '#f7f7fd', border = '#e6e7f2', color = '#5a5f80'): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid ${border};border-radius:10px;">
  <tr>
    <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;color:${color};font-size:13px;line-height:20px;">
      ${html}
    </td>
  </tr>
</table>`;
}

export function stepRow(num: string, title: string, description: string): string {
  return `<tr>
  <td style="padding:0 0 12px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f7fd;border:1px solid #e6e7f2;border-radius:10px;">
      <tr>
        <td width="34" style="padding:14px 0 14px 16px;color:#6d4aff;font-size:15px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(num)}</td>
        <td style="padding:14px 16px 14px 0;color:#5a5f80;font-size:14px;line-height:21px;font-family:Arial,Helvetica,sans-serif;">
          <strong style="color:#12132e;">${escapeHtml(title)}</strong><br />${escapeHtml(description)}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}
