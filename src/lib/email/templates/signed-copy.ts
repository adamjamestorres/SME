import { site } from "@/config/site";
import { formatDateTime } from "../format";
import { layout, p, textFooter, type Email } from "../layout";

export interface SignedCopyData {
  recipientName: string;
  documentName: string;
  signedAt: Date;
}

/** A copy of a signed document, to the signer and the owner. The caller attaches the PDF (#33). */
export function signedCopy({ recipientName, documentName, signedAt }: SignedCopyData): Email {
  const signed = formatDateTime(signedAt);
  const subject = `Signed: ${documentName}`;
  const html = layout({
    preheader: `Your signed copy of ${documentName}`,
    bodyHtml: [
      p(`Hi ${recipientName},`),
      p(`${documentName} was signed on ${signed}. The signed PDF is attached for your records.`),
      p(`Questions? Call us at ${site.phone.display}.`),
    ].join("\n"),
  });
  const text = [
    `Hi ${recipientName},`,
    "",
    `${documentName} was signed on ${signed}. The signed PDF is attached for your records.`,
    "",
    `Questions? Call us at ${site.phone.display}.`,
    "",
    textFooter(),
  ].join("\n");
  return { subject, html, text };
}
