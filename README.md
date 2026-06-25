# Cafe Marketplace and QR Ordering Frontend

Next.js 14 frontend for public cafe discovery, QR table ordering, cafe operations, and platform
administration. Copy `.env.example` to `.env.local`; set `NEXT_PUBLIC_API_URL` to the Fastify
backend and `NEXT_PUBLIC_APP_URL` to this frontend's public origin.

PostHog capture is disabled unless `NEXT_PUBLIC_POSTHOG_KEY` is set. Sentry and Cloudinary
variables are reserved for a later SDK/signed-upload integration; existing forms accept hosted
image URLs.

> Premium restaurant QR ordering entry point — Next.js 14, TypeScript, Tailwind CSS, Framer Motion

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000/table/5
```

## QR Flow

```
Customer scans QR code on table
         ↓
https://yourdomain.com/table/5
         ↓
Next.js extracts tableId = "5"
         ↓
resolveTable("5") → { displayNumber: "5", section: "Main Hall", capacity: 4 }
         ↓
TableLandingClient renders with animations
         ↓
Customer taps "View Menu" → /menu?table=5
```

## Project Structure

```
urban-bites/
├── app/
│   ├── layout.tsx              # Root layout, fonts (Playfair Display + DM Sans)
│   ├── globals.css             # Tailwind + custom CSS (glass, shimmer, grain)
│   ├── page.tsx                # Root → redirects to /table/5 (demo)
│   ├── not-found.tsx           # Custom 404
│   └── table/
│       └── [tableId]/
│           └── page.tsx        # ⭐ QR landing page (Server Component)
│
├── components/
│   ├── TableLandingClient.tsx  # ⭐ Root client component, layout orchestrator
│   ├── AnimatedBackground.tsx  # Fixed BG: photo + overlays + floating orbs
│   ├── RestaurantHero.tsx      # Logo, name, tagline, cuisine, rating
│   ├── TableBadge.tsx          # Glassmorphism card with big table number
│   ├── CTAButton.tsx           # Animated "View Menu" primary CTA
│   ├── MenuTeaser.tsx          # Category pill row (Starters, Mains, etc.)
│   ├── HighlightBadges.tsx     # Feature chips (Award-winning, Seasonal, etc.)
│   └── LoadingSkeleton.tsx     # Shimmer placeholder during mount
│
├── lib/
│   └── restaurant-data.ts      # Mock data + resolveTable() helper
│
├── tailwind.config.ts          # Custom theme: brand colors, fonts, shadows
└── next.config.mjs
```

## Route Examples

| URL          | Table Shown           |
| ------------ | --------------------- |
| `/table/5`   | Table 5 — Main Hall   |
| `/table/12`  | Table 12 — Bar Lounge |
| `/table/A1`  | Table A1              |
| `/table/vip` | Table VIP             |

## Design Tokens

| Token        | Value            | Usage                           |
| ------------ | ---------------- | ------------------------------- |
| Brand amber  | `#d4791a`        | CTA, accents, table number glow |
| Surface dark | `#1a1210`        | Card backgrounds                |
| Base dark    | `#0f0b09`        | Page background                 |
| Display font | Playfair Display | Headlines, logo, table number   |
| Body font    | DM Sans          | All body copy                   |
| Accent font  | DM Mono          | Labels, badges, status text     |

## Connecting to Backend (next steps)

In `app/table/[tableId]/page.tsx`, replace:

```ts
const table = resolveTable(params.tableId) // mock
```

with:

```ts
const table = await fetch(`/api/tables/${params.tableId}`).then((r) => r.json())
```

In `lib/restaurant-data.ts`, replace `RESTAURANT` const with a fetch from `/api/restaurant/:id`.
