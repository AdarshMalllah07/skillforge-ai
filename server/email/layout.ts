import { emailFooter } from './partials/footer';
import {
  emailHeader,
  emailOuterClose,
  emailOuterOpen,
  escapeHtml,
} from './partials/content';

export function renderEmailDocument(options: {
  title: string;
  preheader?: string;
  contentHtml: string;
}): string {
  const preheader = options.preheader || options.title;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${escapeHtml(options.title)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f5fb;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    ${emailOuterOpen()}
      ${emailHeader()}
      ${options.contentHtml}
      ${emailFooter()}
    ${emailOuterClose()}
  </body>
</html>`;
}
