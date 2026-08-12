# HireLoop — Adaptive AI Interview Platform

> 🚀 **LIVE DEMO**: [https://msgid-baskets-nicholas-cruises.trycloudflare.com](https://msgid-baskets-nicholas-cruises.trycloudflare.com)  
> **Problem Statement 2**: The Interview Agent

An AI-powered adaptive interview platform featuring real-time depth-of-knowledge evaluation, candidate proctoring, and automated skill breakdown reports.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's here

```
app/
  page.tsx                        Landing page
  login/page.tsx                  Login
  signup/page.tsx                 Signup (role toggle: company / student)
  dashboard/company/page.tsx      Company dashboard (drives, stats)
  dashboard/company/new/page.tsx  Create-drive form
  dashboard/student/page.tsx      Student dashboard (open drives, sessions)
  layout.tsx                      Fonts + AuthProvider wrapper
  globals.css                     Design tokens (colors, fonts) via Tailwind @theme

components/
  Navbar, Logo, Button, Input, Badge, Card, DriveCard,
  SessionCard, AuthGuard

lib/
  types.ts     TypeScript types mirroring the planned DB schema
               (companies, students, drives, questions, sessions,
               session_answers, session_reports)
  auth.tsx     Mock auth (localStorage-backed) — see below
  store.ts     Mock data store (localStorage-backed) — see below
```

## Try it

1. `npm run dev`, go to `/signup`
2. Sign up as **"I'm hiring"** — lands on the company dashboard with 3 seeded
   sample drives, try **New drive** to add your own
3. Sign up as **"I'm a candidate"** (use a different email) — lands on the
   student dashboard with a seeded completed session + an open drive to try

Everything persists to `localStorage` in your browser, so refreshing keeps
your session and data. Clear site data / use incognito to reset.

## Where the backend plugs in

Two files are the entire seam between "fake data" and "real data." Nothing
in `app/` or `components/` needs to change when you wire up Supabase — they
only import from these two files.

### `lib/auth.tsx`

Currently: signup/login write a fake user object to `localStorage`.

Replace `signUp`, `signIn`, `signOut`, and the initial session-read
`useEffect` with:
```ts
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
supabase.auth.getSession() / onAuthStateChange(...)
```
Keep the `User` shape in `lib/types.ts` — just populate it from the
`companies` / `students` table row after auth instead of localStorage.

### `lib/store.ts`

Currently: `getDrives`, `createDrive`, `getSessionsForStudent`,
`getOpenDrivesForStudents` read/write `localStorage`.

Replace each with a Supabase query against the schema you already planned
(`drives`, `sessions`, `session_answers`, `session_reports` tables) or a
call to a Next.js API route once those exist. Keep the function signatures
identical and the dashboards won't need any changes.

### Not built yet (by design — this was scoped as UI only)

- The actual AI interview flow (question → answer → score → follow-up →
  report) — the "New drive" form saves a draft but doesn't generate
  questions yet
- Row-level security / real auth
- The leaderboard / per-candidate report drill-down view
- "Start interview" on the student dashboard doesn't launch a real session
  yet

## Design tokens

Colors, fonts, and spacing are defined once in `app/globals.css` under
`@theme`. Change a value there and it updates everywhere (Tailwind
generates utility classes like `bg-teal`, `text-ink`, `font-mono` from it).
