import "server-only";
import { ownerEmails } from "@/lib/owner-emails";

export interface EmailAttachment {
  filename: string;
  content: Uint8Array;
  contentType?: string;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Sends one email through Resend's REST API.
 *
 * Without RESEND_API_KEY: in development and test it prints the email to the console (local fake
 * data only) and returns; in production it throws.
 */
export async function sendEmail({ to, subject: rawSubject, html, text, replyTo, attachments }: SendEmailInput): Promise<void> {
  const recipients = [to].flat().filter(Boolean);
  if (recipients.length === 0) throw new Error("sendEmail needs at least one recipient");
  // Subjects can include visitor input (a lead's name); a line break there breaks the header.
  const subject = rawSubject.replace(/\s+/g, " ").trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is not set");
    console.info(`[email] (not sent: no RESEND_API_KEY)\nTo: ${recipients.join(", ")}\nSubject: ${subject}\n\n${text}`);
    return;
  }

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set");

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments?.length
        ? {
            attachments: attachments.map((a) => ({
              filename: a.filename,
              content: Buffer.from(a.content).toString("base64"),
              ...(a.contentType ? { content_type: a.contentType } : {}),
            })),
          }
        : {}),
    }),
  });

  // Only the status: the response body can echo recipients and content.
  if (!res.ok) throw new Error(`Resend request failed with status ${res.status}`);
}

/**
 * Sends an owner alert to every address in OWNER_EMAILS. Throws if the list is empty, so a
 * missing setting shows up in the caller's error handling instead of alerts silently vanishing.
 */
export async function sendToOwners(
  email: Pick<SendEmailInput, "subject" | "html" | "text" | "replyTo" | "attachments">,
): Promise<void> {
  const to = ownerEmails();
  if (to.length === 0) throw new Error("OWNER_EMAILS is not set");
  await sendEmail({ ...email, to });
}
