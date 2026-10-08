import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import {
  escapeHtml,
  leadAlert,
  paymentReceived,
  paymentRequest,
  signatureRequest,
  signedCopy,
  type Email,
} from "./index";

const XSS = `<script>alert("x")</script>`;
const PAY_URL = "https://example.com/pay/abc123";
const SIGN_URL = "https://example.com/sign/def456";

const lead = {
  name: "Pat Driver",
  phone: "+19095550100",
  email: "pat@example.com",
  company: "Desert Freight",
  vehicleType: "heavy_duty" as const,
  serviceName: "Brake shop",
  vehicleDown: false,
  message: "Air brakes are leaking.\nParked at the yard.",
};

function expectWellFormed(email: Email) {
  expect(email.subject).not.toBe("");
  expect(email.html).toContain("max-width:560px");
  expect(email.html).toContain(escapeHtml(site.name));
  expect(email.html).toContain(`href="tel:${site.phone.tel}"`);
  expect(email.text).toContain(site.phone.display);
}

describe("escapeHtml", () => {
  it("escapes the HTML special characters", () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
    );
  });
});

describe("leadAlert", () => {
  it("renders every field, a tap-to-call link and the leads inbox link", () => {
    const email = leadAlert(lead);
    expectWellFormed(email);
    expect(email.subject).toBe("New service request: Pat Driver (Brake shop)");
    expect(email.html).toContain('href="tel:+19095550100"');
    expect(email.html).toContain(`${site.url}/portal/leads`);
    for (const value of ["Pat Driver", "pat@example.com", "Desert Freight", "Heavy duty", "Air brakes are leaking."]) {
      expect(email.html).toContain(value);
      expect(email.text).toContain(value);
    }
    expect(email.text).toContain(`${site.url}/portal/leads`);
    expect(email.text).toContain("tel:+19095550100");
  });

  it("prefixes the subject and flags the body when the vehicle is down", () => {
    const email = leadAlert({ ...lead, vehicleDown: true });
    expect(email.subject).toBe("VEHICLE DOWN: New service request: Pat Driver (Brake shop)");
    expect(email.html).toContain("Vehicle down");
    expect(email.text.startsWith("VEHICLE DOWN")).toBe(true);
  });

  it("falls back to the service slug, then a general label", () => {
    expect(leadAlert({ ...lead, serviceName: null, serviceSlug: "diesel" }).subject).toContain("(diesel)");
    expect(leadAlert({ ...lead, serviceName: null }).subject).toContain("(General request)");
  });

  it("leaves out blank optional fields", () => {
    const email = leadAlert({ name: "Pat", phone: "+19095550100", vehicleDown: false });
    expect(email.text).not.toContain("Email:");
    expect(email.text).not.toContain("Company:");
  });
});

describe("customer and owner templates", () => {
  it("paymentRequest shows the amount and the pay link", () => {
    const email = paymentRequest({
      customerName: "Pat",
      description: "Brake job deposit",
      amountCents: 125050,
      url: PAY_URL,
    });
    expectWellFormed(email);
    expect(email.subject).toContain("$1,250.50");
    expect(email.html).toContain(`href="${PAY_URL}"`);
    expect(email.text).toContain(PAY_URL);
  });

  it("paymentReceived links to the portal", () => {
    const email = paymentReceived({
      customerName: "Pat",
      description: "Brake job deposit",
      amountCents: 5000,
      portalUrl: "https://example.com/portal/payments/1",
    });
    expectWellFormed(email);
    expect(email.subject).toBe("Payment received: $50.00 from Pat");
    expect(email.text).toContain("https://example.com/portal/payments/1");
  });

  it("signatureRequest shows the sign link and expiry date", () => {
    const email = signatureRequest({
      customerName: "Pat",
      documentName: "Repair authorization",
      url: SIGN_URL,
      expiresAt: new Date("2026-10-21T19:00:00Z"),
    });
    expectWellFormed(email);
    expect(email.html).toContain(`href="${SIGN_URL}"`);
    expect(email.text).toContain(SIGN_URL);
    expect(email.text).toContain("October 21, 2026");
  });

  it("signedCopy names the document and signing time", () => {
    const email = signedCopy({
      recipientName: "Pat",
      documentName: "Repair authorization",
      signedAt: new Date("2026-10-07T21:30:00Z"),
    });
    expectWellFormed(email);
    expect(email.subject).toBe("Signed: Repair authorization");
    expect(email.text).toContain("October 7, 2026 at 2:30 PM PDT");
  });
});

describe("escaping", () => {
  const rendered: [string, Email][] = [
    [
      "leadAlert",
      leadAlert({
        ...lead,
        name: XSS,
        email: XSS,
        company: XSS,
        serviceName: XSS,
        message: XSS,
        phone: `+1"><script>`,
      }),
    ],
    ["paymentRequest", paymentRequest({ customerName: XSS, description: XSS, amountCents: 100, url: `${PAY_URL}"${XSS}` })],
    ["paymentReceived", paymentReceived({ customerName: XSS, description: XSS, amountCents: 100, portalUrl: XSS })],
    ["signatureRequest", signatureRequest({ customerName: XSS, documentName: XSS, url: XSS, expiresAt: new Date() })],
    ["signedCopy", signedCopy({ recipientName: XSS, documentName: XSS, signedAt: new Date() })],
  ];

  it.each(rendered)("%s escapes <script> in every value", (_, email) => {
    expect(email.html).not.toMatch(/<script/i);
    expect(email.html).toContain("&lt;script&gt;");
  });
});
