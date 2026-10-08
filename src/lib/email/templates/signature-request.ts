import { site } from "@/config/site";
import { formatDate } from "../format";
import { button, layout, p, textFooter, type Email } from "../layout";

export interface SignatureRequestData {
  customerName: string;
  documentName: string;
  /** The customer's /sign/[token] link. */
  url: string;
  expiresAt: Date;
}

/** To a customer, with their signing link. */
export function signatureRequest({ customerName, documentName, url, expiresAt }: SignatureRequestData): Email {
  const expires = formatDate(expiresAt);
  const subject = `Please sign: ${documentName}`;
  const html = layout({
    preheader: `${site.name} sent you ${documentName} to sign`,
    bodyHtml: [
      p(`Hi ${customerName},`),
      p(`${site.name} sent you a document to review and sign: ${documentName}.`),
      button(url, "Review and sign"),
      p(`This link works until ${expires}.`),
      p(`Questions? Call us at ${site.phone.display}.`),
    ].join("\n"),
  });
  const text = [
    `Hi ${customerName},`,
    "",
    `${site.name} sent you a document to review and sign: ${documentName}.`,
    "",
    `Review and sign: ${url}`,
    "",
    `This link works until ${expires}.`,
    "",
    `Questions? Call us at ${site.phone.display}.`,
    "",
    textFooter(),
  ].join("\n");
  return { subject, html, text };
}
