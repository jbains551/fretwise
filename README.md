# 🎸 Fretwise

**Live:** https://fretwise-vert.vercel.app

Your daily guitar studio — lessons, practice rounds, a metronome, an interactive
fretboard, and a practice tracker, in one calm place. Built to open every day.

Fretwise works **fully offline and local-first** out of the box (your data lives in
the browser). Cloud sign-in, cross-device sync, and AI features are **optional
add-ons** you can turn on when you're ready.

---

## Features

- **Instructor-led lessons** — a guided path from first chords → strumming → barre
  chords → scales, with diagrams, tips, and embedded practice.
- **Practice rounds** — a chord-change trainer (count your changes/min), a strumming
  workout that auto-advances chords with the metronome, and a scale runner. Each one
  logs to your tracker.
- **Metronome** — accurate Web Audio engine with tap tempo, time signatures,
  subdivisions, and a visual pulse.
- **Interactive fretboard** — tap any note to hear it (Karplus–Strong plucked-string
  synth), a scale visualizer across the neck, and a browsable chord library.
- **Practice tracker** — quick-log or free-journal entries, daily streaks, goals,
  a 14-day practice chart, a song catalog with BPM sparklines, and an AI weekly digest.
- **Beautiful, responsive UI** — warm "studio" theme, light/dark, phone-first with a
  bottom tab bar and a desktop sidebar.

---

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

That's it — no accounts, no database, no API keys required. Everything is saved to
your browser's local storage.

---

## Optional: turn on the extras

All of these are independent. Add only what you want. Copy `.env.example` to
`.env.local` first.

### 1. AI features (journal parsing + weekly digest)

1. Get an API key at <https://console.anthropic.com>.
2. Set `ANTHROPIC_API_KEY` in `.env.local`.
3. Restart `npm run dev`.

Now the **Journal** tab in "Log practice" extracts your minutes, songs, and BPMs from
free text, and the **Weekly digest** button on the Tracker writes you an instructor-style
progress summary. Model defaults to `claude-sonnet-4-6` (override with `FRETWISE_AI_MODEL`).

### 2. Cloud sync (Postgres)

Easiest path is **Neon** via the Vercel Marketplace (free tier is plenty):

1. In your Vercel project → **Storage → Create Database → Neon**. Vercel sets
   `DATABASE_URL` for you. For local dev, copy that value into `.env.local`.
2. Create the tables:
   ```bash
   npm run db:push
   ```
3. The `/api/sync` endpoint now works (`GET` to pull, `POST` to push). See
   `src/app/api/sync/route.ts`.

The schema lives in `src/db/schema.ts` (adapted from the original `schema.sql`, with a
`user_id` column for multi-user). It runs only when `DATABASE_URL` is set — otherwise the
sync route returns `503` and the app stays local-first.

### 3. Sign-in (Clerk)

Clerk is the native auth option on the Vercel Marketplace.

1. Add Clerk from **Vercel → Integrations**, or create a project at
   <https://clerk.com>. Put the two keys in `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```
2. `npm install @clerk/nextjs`
3. Wrap the app in `src/app/layout.tsx` with `<ClerkProvider>`.
4. Add the proxy file (Next.js 16 renamed `middleware` → **`proxy`**) at `src/proxy.ts`:
   ```ts
   import { clerkMiddleware } from "@clerk/nextjs/server";
   export const proxy = clerkMiddleware();
   export const config = { matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"] };
   ```
5. In `src/lib/auth.ts`, swap `getUserId` to read the Clerk session:
   ```ts
   import { auth } from "@clerk/nextjs/server";
   export async function getUserId() { return (await auth()).userId; }
   ```

> This project targets **Next.js 16**, where `params`/`searchParams` are async and
> middleware is named `proxy`. Keep that in mind when adding routes.

### 4. Deploy to Vercel

```bash
npm i -g vercel   # if needed
vercel            # link + preview
vercel --prod     # production
```

Add your env vars in **Vercel → Settings → Environment Variables** (or let the Neon/Clerk
integrations add them automatically). You'll get a live URL to open on your phone next to
the guitar. Point your own domain (e.g. `guitar.jbains.com`) at it under
**Vercel → Settings → Domains**.

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # Today dashboard
│   ├── lessons/            # curriculum browser + lesson player
│   ├── practice/           # practice-round launcher
│   ├── metronome/          # standalone metronome
│   ├── fretboard/          # scale explorer + chord library
│   ├── tracker/            # streaks, charts, history, songs
│   └── api/                # enrich, digest, sync route handlers
├── components/             # UI primitives, music widgets, dialogs
├── hooks/                  # useMetronome
├── lib/
│   ├── music/              # notes, chords, scales, audio synth, metronome engine
│   ├── curriculum.ts       # the lesson content
│   ├── store.ts            # Zustand local-first store (+ streak logic)
│   ├── ai.ts               # Claude enrichment + digest
│   └── types.ts            # shared data model
└── db/                     # Drizzle Postgres schema + client (optional)
```

---

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand · Web Audio API ·
Drizzle + Postgres (optional) · Clerk (optional) · Claude API (optional).

Made with care for an early guitarist's journey. Keep showing up. 🎶
