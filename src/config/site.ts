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
    "Heavy-duty truck and auto repair in Fontana and the High Desert: fleet maintenance, brakes and diesel repair. Our new website is coming soon. The shop is open now.",
  phone: { display: "(626) 639-9696", tel: "+16266399696" },
  email: "smeautoandhdtruck@gmail.com",
  address: { city: "Hesperia", region: "CA", country: "USA" },
  serviceArea: "Fontana and the High Desert",
  // TODO(#10): real shop hours.
  hours: [{ label: "Shop", value: "Mon–Fri, 7am–6pm" }],
  services: [
    "Fleet maintenance",
    "Brake shop",
    "Diesel & heavy-duty repair",
    "Auto repair",
  ],
} as const;
