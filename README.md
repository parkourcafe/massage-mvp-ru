# Massage Marketplace MVP

AI platform for **independent professional massage therapists** and clients.
Professional wellness / therapeutic massage **only** — no erotic, adult,
sexual or "special service" content is permitted (enforced by automated
moderation + manual review).

This is a **separate product** from the tutor MVP. Domain mapping:

| Tutor concept | Massage concept |
|---|---|
| Tutor | Therapist |
| Student | Client |
| Subject | Massage service / modality |
| Lesson | Session |
| First meeting | Booking / first session |
| Inquiry | Booking inquiry |
| Student CRM | Client CRM |
| Private lesson feedback | Private session notes / client feedback |

## Stack

Next.js (App Router) · React · TailwindCSS · Supabase (Auth / Postgres /
Storage) · OpenAI · YooKassa · Vercel.

## Running

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run test
npm run build
```

The app runs out of the box with **no external services**: it uses an
in-memory demo repository seeded with professional therapist profiles
(`src/lib/db`). Configure `.env.local` (see `.env.example`) to wire
Supabase, OpenAI and YooKassa for production.

### Database

Canonical schema and RLS live in `supabase/migrations/`:

- `0001_init.sql` — all tables (profiles, services, profile_media,
  favorites, bookings, booking_messages, booking_events, clients,
  client_sessions, therapist_private_session_notes,
  client_private_feedback, support_requests, plans, subscriptions,
  payments, payment_events, invoices, moderation_flags).
- `0002_rls.sql` — Row Level Security. Public read is limited to
  published+approved profiles; `contact_value`, private addresses,
  bookings, CRM and payments are never public; booking client access is
  via an unguessable token at the API layer.

## Key behaviours

- **Privacy**: exact therapist/client addresses are never public; client
  address is visible to the therapist only after the booking is
  confirmed. `/dashboard/*`, `/admin/*`, `/favorites`, `/match/results`,
  `/booking/[token]`, `/therapist/[slug]/booking` are `noindex`.
- **SEO**: `/therapist/[slug]` is only indexed when the profile quality
  score ≥ 70 (`src/lib/quality.ts`). `robots.ts` / `sitemap.ts` enforce
  the index/noindex rules.
- **Moderation**: adult/erotic wording is hard-blocked; suspicious
  titles and unsafe medical claims are flagged for manual review
  (`src/lib/moderation.ts`, `/admin/moderation`).
- **Billing**: YooKassa subscription (Russia MVP). Pro is activated
  **only** by the verified webhook (`/api/payments/webhook/yookassa`),
  never by the frontend redirect. Feature gates in `src/lib/plans.ts`.
- **Unified booking inquiry**: one flow for chat + booking
  (`/therapist/[slug]/booking` → `/booking/[token]` →
  `/dashboard/bookings/[id]`), with status/outcome lifecycle and
  "convert to client" into the CRM.

## Routing note

Next.js cannot have two sibling dynamic segments, so
`/therapists/[service]` and `/therapists/[city]` are served by a single
`/therapists/[seg1]` segment that resolves a service or city from the
catalog (`/therapists/[seg1]/[seg2]` handles service + city). All URL
patterns from the spec work.

## Build artifact

```bash
bash scripts/build-tarball.sh   # -> massage-marketplace-mvp.tar.gz
```
