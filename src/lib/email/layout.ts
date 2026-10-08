import { site } from "@/config/site";
import { escapeHtml } from "./escape";

export interface Email {
  subject: string;
  html: string;
  text: string;
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const ADDRESS = `${site.address.city}, ${site.address.region}`;

/**
 * Wraps `bodyHtml` (already escaped) in a single-column, phone-friendly email: max 560px wide,
 * inline styles only, with the business name, a tap-to-call link and the address.
 */
export function layout({ preheader, bodyHtml }: { preheader: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(site.name)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;">
<tr><td style="padding:20px 24px;border-bottom:1px solid #e4e4e7;font-family:${FONT};font-size:18px;font-weight:700;color:#18181b;">${escapeHtml(site.name)}</td></tr>
<tr><td style="padding:24px;font-family:${FONT};font-size:16px;line-height:1.5;color:#27272a;">
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e4e4e7;font-family:${FONT};font-size:14px;line-height:1.5;color:#52525b;">
${escapeHtml(site.name)}<br>
<a href="tel:${escapeHtml(site.phone.tel)}" style="color:#18181b;font-weight:600;">${escapeHtml(site.phone.display)}</a><br>
${escapeHtml(ADDRESS)}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** The plain-text footer that matches the HTML one. */
export function textFooter(): string {
  return `--\n${site.name}\n${site.phone.display}\n${ADDRESS}`;
}

/** A large, tappable button link. `url` and `label` are escaped here. */
export function button(url: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 24px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${escapeHtml(label)}</a></p>`;
}

/** A paragraph of escaped text. */
export function p(text: string): string {
  return `<p style="margin:0 0 16px;">${escapeHtml(text)}</p>`;
}
