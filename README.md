# LeadFlow

A personal lead tracker CRM built with Next.js, Prisma, and SQLite. Track leads through a kanban pipeline, manage follow-ups, and get email reminders on follow-up day.

No authentication — designed as a local personal tool, with optional online hosting on Vercel.

## Features

- **Pipeline view** — drag-and-drop kanban across Cold → Contacted → Replied → Interested → Closed → Dead
- **List view** — searchable table with filters by channel and status
- **Lead details** — slide-in panel with notes, status moves, edit, and delete
- **Follow-up tracking** — overdue / today / tomorrow labels on cards
- **CSV export** — download all leads
- **Email reminders** — digest email on follow-up day via [Resend](https://resend.com)

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) (recommended) or npm

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/olivebishop/lead-flow.git
cd lead-flow
pnpm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `file:./dev.db` for local SQLite |
| `RESEND_API_KEY` | For reminders | API key from [Resend](https://resend.com) |
| `REMINDER_EMAIL` | For reminders | Your email address (recipient) |
| `EMAIL_FROM` | For reminders | Sender address, e.g. `LeadFlow <onboarding@resend.dev>` |
| `CRON_SECRET` | Online only | Random string to protect the reminders API |

> **Never commit `.env` or `*.db` files.** They are gitignored. Your local database contains personal lead data.

### 3. Database

```bash
pnpm db:generate
pnpm db:push
```

This creates `prisma/dev.db` with the Lead schema.

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Generate Prisma client and build for production |
| `pnpm start` | Run production build |
| `pnpm db:push` | Sync schema to the database |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm reminders:send` | Send follow-up reminder emails manually |
| `pnpm lint` | Run ESLint |

## Email reminders

Reminders check for leads whose **follow-up date is today** and send one digest email listing them all. Each lead is reminded only once per follow-up date.

### Local

Run manually or schedule daily (e.g. Windows Task Scheduler):

```bash
pnpm reminders:send
```

### Online (Vercel)

Two triggers work together:

1. **GitHub Actions** (recommended) — runs daily even if you don't open the site  
   Add secrets in **GitHub → Settings → Secrets → Actions**:
   - `REMINDER_URL` — `https://your-app.vercel.app/api/cron/followup-reminders`
   - `CRON_SECRET` — same value as in Vercel env vars

   Workflow: `.github/workflows/followup-reminders.yml` (daily at 6:00 AM UTC)

2. **Opening the app** — sends reminders as a backup when you visit the site

You can also trigger manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/followup-reminders
```

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `RESEND_API_KEY`
   - `REMINDER_EMAIL`
   - `EMAIL_FROM`
   - `CRON_SECRET`
4. Add GitHub Actions secrets (see above)

### Database on Vercel

SQLite file storage (`file:./dev.db`) **does not persist** on Vercel's serverless runtime. For production, use a hosted database such as [Turso](https://turso.tech) or Postgres and update `DATABASE_URL` accordingly. Keep `file:./dev.db` for local development only.

## Project structure

```
app/
  page.tsx              # Main CRM dashboard
  api/leads/            # CRUD API routes
  api/cron/             # Follow-up reminder endpoint
components/
  Dashboard.tsx         # CRM UI
  PipelineView.tsx      # Kanban board
  ListView.tsx          # Table view
  LeadModal.tsx         # Add / edit lead
  DetailPanel.tsx       # Lead detail slide-in
  SearchBar.tsx
lib/
  prisma.ts             # Prisma client
  reminders.ts          # Reminder logic
  email.ts              # Resend integration
prisma/
  schema.prisma         # Database schema
scripts/
  send-reminders.ts     # CLI reminder script
```

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Prisma](https://www.prisma.io) + SQLite
- [Tailwind CSS](https://tailwindcss.com)
- [Resend](https://resend.com) for email
- [shadcn/ui](https://ui.shadcn.com) components

## License

Private / personal use.
