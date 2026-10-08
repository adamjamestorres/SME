import { site } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { button, layout, p, textFooter, type Email } from "../layout";

export interface PaymentRequestData {
  customerName: string;
  description: string;
  amountCents: number;
  /** The customer's /pay/[token] link. */
  url: string;
}

/** To a customer, with their payment link. */
export function paymentRequest({ customerName, description, amountCents, url }: PaymentRequestData): Email {
  const amount = formatMoney(amountCents);
  const subject = `Payment request from ${site.name}: ${amount}`;
  const html = layout({
    preheader: `${amount} for ${description}`,
    bodyHtml: [
      p(`Hi ${customerName},`),
      p(`Here's your payment request from ${site.name}.`),
      p(`${description}: ${amount}`),
      button(url, `Pay ${amount}`),
      p(`Questions? Call us at ${site.phone.display}.`),
    ].join("\n"),
  });
  const text = [
    `Hi ${customerName},`,
    "",
    `Here's your payment request from ${site.name}.`,
    "",
    `${description}: ${amount}`,
    "",
    `Pay securely: ${url}`,
    "",
    `Questions? Call us at ${site.phone.display}.`,
    "",
    textFooter(),
  ].join("\n");
  return { subject, html, text };
}
