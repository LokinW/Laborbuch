# Laborbuch

Tiny reservation tool for the local fablab. Vite + React + TypeScript + Tailwind + shadcn/ui, with Supabase for auth and storage. Two pages — login and dashboard — and three modals (book slot, comments, logout).

## Stack

- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS, shadcn/ui (new-york style), React Router, TanStack Query, Sonner
- **Backend**: Supabase (Postgres + auth + RLS)
- **Hosting**: Vercel

## Getting started

```bash
npm install
cp .env.example .env   # fill in Supabase URL + anon key
npm run dev
```

### Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL editor → paste `supabase/schema.sql` and run it. This creates `profiles`, `machines`, `reservations`, `comments`, `favorites`, RLS policies, an auto-profile trigger, and seeds two example machines.
3. Auth → Users → invite each fablab friend manually (you mentioned you'll handle accounts). The trigger creates their `profiles` row automatically.
4. Project Settings → API → copy `Project URL` (`VITE_SUPABASE_URL`) and `anon public` key (`VITE_SUPABASE_ANON_KEY`) into `.env`.

### Adding machines

Edit rows directly in the Supabase Table Editor under `public.machines`. Set `image_url` to any public image URL (e.g. paste an `https://` link from the manufacturer).

## Booking model

- Hourly slots, daily window 08:00–20:00 (configurable in `src/lib/slots.ts`).
- Each row in `reservations` is one (machine, date, hour). Consecutive hours by the same user on the same machine collapse into one displayed booking.
- "In Nutzung" = there is a reservation right now (today, current hour).
- Reservations are visible to everyone authenticated; only the owner can create/cancel their own (enforced by RLS).

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo into Vercel — framework preset auto-detects Vite.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
4. Deploy. `vercel.json` handles the SPA rewrite to `/`.

## Project layout

```
src/
  pages/             Login.tsx, Dashboard.tsx
  components/
    ui/              shadcn primitives (button, dialog, input, …)
    laborbuch/       app-specific (AppHeader, MachineCard, BookSlotDialog, …)
  hooks/             use-machines, use-reservations, use-comments, use-favorites
  lib/               supabase client, auth context, slot utilities
supabase/
  schema.sql         run once in Supabase SQL editor
```
