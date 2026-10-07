import Link from "next/link";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { site } from "@/config/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phone.tel,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: "US",
  },
  areaServed: site.serviceArea,
  makesOffer: site.services.map((name) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name },
  })),
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Home() {
  const { address } = site;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="hazard-stripe h-1.5" aria-hidden="true" />

      <div className="relative isolate flex flex-1 flex-col overflow-hidden">
        {/* Background: faint grid plus a warm glow behind the headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-size-[56px_56px] opacity-40 mask-[radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 -z-10 size-[36rem] rounded-full bg-brand/10 blur-3xl"
        />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" className={`flex items-center gap-3 rounded-md ${focusRing}`}>
            <span className="grid h-10 place-items-center rounded-md bg-brand px-2 font-display text-xl font-extrabold tracking-wide text-brand-ink">
              {site.shortName}
            </span>
            <span className="font-display text-lg leading-none font-semibold tracking-wide whitespace-nowrap uppercase">
              Auto &amp; HD Truck
            </span>
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised/80 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span>
              <span className="hidden sm:inline">Roadside open</span>
              <span className="sm:hidden">Open</span> 24/7
            </span>
          </span>
        </header>

        <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:py-20">
          <section aria-labelledby="hero-title">
            <p className="inline-flex items-center gap-2 font-display text-sm font-semibold tracking-[0.2em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" aria-hidden="true" />
              New website coming soon
            </p>
            <h1
              id="hero-title"
              className="mt-5 font-display text-5xl leading-[0.95] font-extrabold tracking-tight text-balance uppercase sm:text-7xl lg:text-8xl"
            >
              Heavy-duty truck <span className="text-brand">&amp; auto repair</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-pretty text-muted sm:text-xl">
              Fleet maintenance, brakes, diesel repair and mobile roadside service. We&apos;re
              building our new site. The shop is open now, so give us a call.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${site.phone.tel}`}
                className={`inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md bg-brand px-6 font-display text-lg font-bold tracking-wide text-brand-ink uppercase transition-colors hover:bg-brand-hover ${focusRing}`}
              >
                <PhoneIcon className="size-5" />
                Call {site.phone.display}
              </a>
              <a
                href={`mailto:${site.email}`}
                className={`inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md border border-line bg-surface-raised px-6 font-display text-lg font-semibold tracking-wide uppercase transition-colors hover:border-muted ${focusRing}`}
              >
                <MailIcon className="size-5" />
                Email us
              </a>
            </div>
          </section>

          <section
            aria-labelledby="services-title"
            className="rounded-xl border border-line bg-surface-raised/80 p-6 backdrop-blur sm:p-8"
          >
            <h2
              id="services-title"
              className="font-display text-sm font-semibold tracking-[0.2em] text-muted uppercase"
            >
              What we fix
            </h2>
            <ol className="mt-5 divide-y divide-line">
              {site.services.map((service, i) => (
                <li key={service} className="flex items-baseline gap-4 py-3.5">
                  <span className="font-display text-sm font-semibold text-brand tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-2xl font-semibold tracking-wide uppercase">
                    {service}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-line pt-5 text-sm text-muted">
              Light duty to Class 8, trailers and fleets. Serving {site.serviceArea}.
            </p>
          </section>
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-muted sm:grid-cols-3 sm:px-6">
            <div className="flex gap-3">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <address className="not-italic">
                {address.city}, {address.region}, {address.country}
              </address>
            </div>
            <div className="flex gap-3">
              <ClockIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <dl className="grid grid-cols-[auto_1fr] gap-x-3">
                {site.hours.map((h) => (
                  <div key={h.label} className="contents">
                    <dt className="font-medium text-fg">{h.label}</dt>
                    <dd>{h.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex gap-3">
              <PhoneIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <a href={`tel:${site.phone.tel}`} className={`rounded-sm text-fg hover:text-brand ${focusRing}`}>
                  {site.phone.display}
                </a>
                <br />
                <a href={`mailto:${site.email}`} className={`rounded-sm hover:text-brand ${focusRing}`}>
                  {site.email}
                </a>
              </div>
            </div>
          </div>
          <p className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-muted/70 sm:px-6">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
