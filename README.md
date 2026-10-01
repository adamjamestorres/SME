# SME

Website for SME Auto & HD Truck: heavy-duty truck and auto repair, fleet maintenance and 24/7 mobile roadside service. Right now it serves a dark-mode "coming soon" home page.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc` |

## Where things live

- `src/config/site.ts`: business name, phone, email, address, hours and services. Placeholder values are marked `TODO(#10)`.
- `src/app/page.tsx`: the coming-soon page, including LocalBusiness (AutoRepair) JSON-LD.
- `src/app/layout.tsx`: fonts and site-wide metadata (title, description, Open Graph, Twitter card).
- `src/app/opengraph-image.tsx` and `twitter-image.tsx`: the 1200×630 social share card, generated at build time.
- `src/app/icon.tsx` and `apple-icon.tsx`: favicon and home-screen icon.
- `src/app/robots.ts`, `sitemap.ts` and `manifest.ts`.
- `src/app/globals.css`: color tokens. These are placeholders until the client's brand colors arrive (#11).

## Environment

`NEXT_PUBLIC_SITE_URL` sets the absolute URL used for canonical links, Open Graph images and the sitemap. On Vercel it falls back to the production domain.
