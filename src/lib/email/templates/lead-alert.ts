import { site } from "@/config/site";
import { escapeHtml } from "../escape";
import { button, layout, textFooter, type Email } from "../layout";

export type VehicleType = "car_light_truck" | "medium_duty" | "heavy_duty" | "trailer" | "fleet";

const VEHICLE_LABELS: Record<VehicleType, string> = {
  car_light_truck: "Car or light truck",
  medium_duty: "Medium duty",
  heavy_duty: "Heavy duty",
  trailer: "Trailer",
  fleet: "Fleet",
};

export interface LeadAlertData {
  name: string;
  /** E.164, e.g. +19095550100. */
  phone: string;
  email?: string | null;
  company?: string | null;
  vehicleType?: VehicleType | null;
  /** The service's display name; falls back to the slug. */
  serviceName?: string | null;
  serviceSlug?: string | null;
  vehicleDown: boolean;
  message?: string | null;
}

/** To the owner when a service request comes in from the site. */
export function leadAlert(lead: LeadAlertData): Email {
  const service = lead.serviceName || lead.serviceSlug || "General request";
  const subject = `${lead.vehicleDown ? "VEHICLE DOWN: " : ""}New service request: ${lead.name} (${service})`;
  const leadsUrl = `${site.url}/portal/leads`;

  const rows: [string, string][] = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email ?? ""],
    ["Company", lead.company ?? ""],
    ["Vehicle", lead.vehicleType ? VEHICLE_LABELS[lead.vehicleType] : ""],
    ["Service", service],
    ["Vehicle down", lead.vehicleDown ? "Yes, it can't be driven right now" : "No"],
    ["Message", lead.message ?? ""],
  ];
  const filled = rows.filter(([, value]) => value !== "");

  const htmlRows = filled
    .map(([label, value]) => {
      const shown =
        label === "Phone"
          ? `<a href="tel:${escapeHtml(lead.phone)}" style="color:#18181b;font-weight:600;">${escapeHtml(value)}</a>`
          : escapeHtml(value).replace(/\n/g, "<br>");
      return `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#52525b;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;vertical-align:top;">${shown}</td></tr>`;
    })
    .join("\n");

  const html = layout({
    preheader: `${lead.name} · ${lead.phone}`,
    bodyHtml: [
      lead.vehicleDown
        ? `<p style="margin:0 0 16px;padding:12px;background:#fef2f2;color:#991b1b;font-weight:700;border-radius:6px;">Vehicle down: it can't be driven right now.</p>`
        : "",
      `<p style="margin:0 0 16px;font-weight:600;">New service request</p>`,
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px;">${htmlRows}</table>`,
      button(`tel:${lead.phone}`, `Call ${lead.name}`),
      `<p style="margin:0;"><a href="${escapeHtml(leadsUrl)}" style="color:#18181b;">Open the leads inbox</a></p>`,
    ].join("\n"),
  });

  const text = [
    ...(lead.vehicleDown ? ["VEHICLE DOWN: it can't be driven right now.", ""] : []),
    "New service request",
    "",
    ...filled.map(([label, value]) => `${label}: ${value}`),
    "",
    `Call: tel:${lead.phone}`,
    `Leads inbox: ${leadsUrl}`,
    "",
    textFooter(),
  ].join("\n");

  return { subject, html, text };
}
