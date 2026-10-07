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
  phone: { display: "(626) 639-9696", tel: "+16266399696" },
  // TODO(#10): real email.
  email: "service@example.com",
  address: { city: "Hesperia", region: "CA", country: "USA" },
  serviceArea: "Southern California",
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
