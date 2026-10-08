# SME

Website for SME Auto & HD Truck: heavy-duty truck and auto repair and fleet maintenance in Fontana and the High Desert. Right now it serves a dark-mode "coming soon" home page.

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
| `npm test` | Run the Vitest unit tests once |
| `npm run test:watch` | Run Vitest in watch mode |

## Where things live

- `src/config/site.ts`: business name, phone, email, address, hours and services. Placeholder values are marked `TODO(#10)`.
- `src/app/(site)/page.tsx`: the coming-soon page, including LocalBusiness (AutoRepair) JSON-LD.
- `src/app/layout.tsx`: fonts and site-wide metadata (title, description, Open Graph, Twitter card).
- `src/app/opengraph-image.tsx` and `twitter-image.tsx`: the 1200×630 social share card, generated at build time.
- `src/app/icon.tsx` and `apple-icon.tsx`: favicon and home-screen icon.
- `src/app/robots.ts`, `sitemap.ts` and `manifest.ts`.
- `src/app/globals.css`: color tokens. These are placeholders until the client's brand colors arrive (#11).

## Route layout

Folders in parentheses are route groups: they share a layout but don't appear in the URL.

| Path | Folder | What it is |
| --- | --- | --- |
| `/`, public pages | `src/app/(site)/` | Marketing site (header and footer come in #12) |
| `/portal` | `src/app/portal/` | Owner portal, never indexed. Signed-in pages live in `portal/(app)/` |
| `/pay/[token]` | `src/app/pay/` | Customer payment page, no site nav, never indexed |
| `/sign/[token]` | `src/app/sign/` | Customer signing page, no site nav, never indexed |
| `/api/health` | `src/app/api/health/` | Returns `{"ok":true}` |

The root `layout.tsx` and the metadata files (icons, Open Graph image, robots, sitemap, manifest) stay in `src/app/`.

## Environment

Every environment variable is listed with a comment in [`.env.example`](.env.example). Copy it to `.env.local` for local development and never commit real values.

`NEXT_PUBLIC_SITE_URL` sets the absolute URL used for canonical links, Open Graph images and the sitemap. On Vercel it falls back to the production domain.
