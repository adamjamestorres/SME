// One place for business details. Values marked TODO are placeholders until
// the client sends real content (issue #10).

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const site = {
  name: "SME Auto & HD Truck",
  shortName: "SME",
  url: siteUrl,
  tagline: "Heavy-duty truck & auto repair",
  description:
    "Heavy-duty truck and auto repair: fleet maintenance, brakes, diesel repair and 24/7 mobile roadside service. Our new website is coming soon. The shop is open now.",
  // TODO(#10): real phone, email, address and service area.
  phone: { display: "(555) 010-0100", tel: "+15550100100" },
  email: "service@example.com",
  address: { street: "123 Industrial Way", city: "Your City", region: "ST", postalCode: "00000" },
  serviceArea: "Your City and surrounding highways",
  hours: [
    { label: "Shop", value: "Mon–Fri, 7am–6pm" },
    { label: "Roadside", value: "24/7, 365 days" },
  ],
  services: [
    "Fleet maintenance",
    "Brake shop",
    "Diesel & heavy-duty repair",
    "Auto repair",
    "24/7 mobile roadside",
  ],
} as const;
