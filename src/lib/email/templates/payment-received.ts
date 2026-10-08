import { formatMoney } from "@/lib/money";
import { button, layout, p, textFooter, type Email } from "../layout";

export interface PaymentReceivedData {
  customerName: string;
  description: string;
  amountCents: number;
  /** The payment request's page in the portal. */
  portalUrl: string;
}

/** To the owner when a customer pays. */
export function paymentReceived({
  customerName,
  description,
  amountCents,
  portalUrl,
}: PaymentReceivedData): Email {
  const amount = formatMoney(amountCents);
  const subject = `Payment received: ${amount} from ${customerName}`;
  const html = layout({
    preheader: `${customerName} paid ${amount}`,
    bodyHtml: [
      p(`${customerName} paid ${amount}.`),
      p(`For: ${description}`),
      button(portalUrl, "View in the portal"),
    ].join("\n"),
  });
  const text = [
    `${customerName} paid ${amount}.`,
    "",
    `For: ${description}`,
    "",
    `View in the portal: ${portalUrl}`,
    "",
    textFooter(),
  ].join("\n");
  return { subject, html, text };
}
