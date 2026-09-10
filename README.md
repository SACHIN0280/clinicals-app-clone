# Clinicals Mini

A clinical training lead intake & follow-up tracker — a PWA built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- **Public enquiry form** at `/` — collects name, phone, city with real-time validation
- **Team login** at `/login` — Supabase email/password auth with session persistence
- **Team dashboard** at `/dashboard` — protected route with search, stage filtering (with live counts), 1-tap stage advancement, Call & WhatsApp quick actions
- **PWA** — installable, works offline, update prompt on new deploys

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
git clone <repo-url>
cd clinicals_assignment
npm install
```

### 2. Set Up Supabase

1. Go to your Supabase project → **SQL Editor**
2. Run the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Go to **Authentication → Users** → **Add user** to create a team login

### 3. Configure Environment Variables

Copy `.env` and fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Deployment

Push to GitHub and connect to **Vercel** or **Netlify**. Set the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the hosting platform's dashboard.

## Known Limitations

- **No offline form submission:** The enquiry form requires a network connection to submit. Queuing leads locally (IndexedDB + background sync) was considered out of scope for this MVP.
- **No real-time updates:** The dashboard does not auto-refresh when another team member updates a lead. A manual refresh button is provided. Supabase Realtime subscriptions would solve this in a next iteration.
- **Single-team auth:** There's no per-user role management. All authenticated users have full read/write access to all enquiries.
- **WhatsApp notification not wired:** The notification system described in NOTES.md (section 2) is documented as an architecture decision but not implemented as code in this repo.
