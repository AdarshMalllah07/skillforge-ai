/** Shared email width — tablet-like column used by header, body, and footer. */
export const EMAIL_WIDTH = 600;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Outer page wrapper: centers a fixed tablet-width email column. */
export function emailOuterOpen(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5fb;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="${EMAIL_WIDTH}" cellpadding="0" cellspacing="0" border="0" style="width:${EMAIL_WIDTH}px;max-width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border-radius:16px;border:1px solid #e6e7f2;">`;
}

export function emailOuterClose(): string {
  return `</table>
    </td>
  </tr>
</table>`;
}

/** Header block — same width as content/footer (no full-bleed). */
export function emailHeader(): string {
  return `<tr>
  <td style="background-color:#0f1030;padding:28px 36px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="34" style="padding-right:10px;">
          <div style="width:34px;height:34px;line-height:34px;text-align:center;border-radius:9px;background-color:#6d4aff;color:#ffffff;font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">S</div>
        </td>
        <td style="vertical-align:middle;">
          <div style="color:#ffffff;font-size:17px;font-weight:bold;letter-spacing:0.2px;">SkillForge AI</div>
          <div style="color:#8f93bf;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;padding-top:2px;">AI Assessment Platform</div>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
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

/** Body rows go inside the shared 600px column (white card section). */
export function contentShell(innerRowsHtml: string): string {
  return `<tr>
  <td style="background-color:#ffffff;padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${innerRowsHtml}
    </table>
  </td>
</tr>`;
}
