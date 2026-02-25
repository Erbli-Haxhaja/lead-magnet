# GitHub Copilot Instructions — HTD Solutions Lead Magnet System

## Project Overview
This is a **Next.js 14 (App Router) + TypeScript** lead magnet platform for HTD Solutions. Admins upload documents via an admin portal; visitors submit their email on a public landing page and receive the document as an email attachment via Resend. No file downloads exist on the website itself.

## Tech Stack
- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS v4
- **Database:** Neon PostgreSQL (serverless) via `@neondatabase/serverless`
- **ORM:** Drizzle ORM — schema in `src/db/schema.ts`, config in `drizzle.config.ts`
- **File Storage:** Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3` — lib in `src/lib/r2.ts`
- **Auth:** NextAuth.js v5 (beta) credentials provider — config in `src/lib/auth.ts`
- **Email:** Resend — client in `src/lib/resend.ts`, attachment-based delivery
- **UI:** shadcn/ui components in `src/components/ui/`, custom HTD dark theme
- **Deployment:** Vercel

## Project Structure
```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx              # Admin login (public)
│   │   └── (dashboard)/
│   │       ├── layout.tsx              # Sidebar layout (protected)
│   │       ├── actions.ts              # Upload, toggle, delete server actions
│   │       ├── documents/
│   │       │   ├── page.tsx            # Documents list with stats
│   │       │   └── documents-table.tsx # Client table component
│   │       ├── upload/
│   │       │   └── page.tsx            # File upload form
│   │       └── leads/
│   │           ├── page.tsx            # Leads list
│   │           └── leads-table.tsx     # Client table with CSV export
│   ├── d/[slug]/
│   │   ├── page.tsx                    # Public lead-capture landing page
│   │   ├── lead-capture-flow.tsx       # 3-step form: email → confirm → success
│   │   └── actions.ts                  # submitLeadEmail server action
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts # NextAuth handler
│   │   ├── delivery-status/route.ts    # Polled by confirmation screen
│   │   └── webhooks/resend/route.ts    # Resend webhook handler
│   ├── layout.tsx
│   ├── page.tsx                        # Redirects → /admin/documents
│   └── globals.css                     # HTD dark theme CSS variables
├── db/
│   ├── schema.ts                       # Drizzle table definitions (source of truth)
│   ├── schema.sql                      # Raw SQL mirror of schema.ts (kept in sync)
│   ├── index.ts                        # Drizzle + Neon client singleton
│   └── seed.ts                         # Seeds first admin account
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── r2.ts                           # R2 upload/get/delete helpers
│   ├── resend.ts                       # Resend client
│   └── utils.ts                        # shadcn cn() utility
└── middleware.ts                        # Protects /admin/* routes
```

## Design System — HTD Solutions Theme
The app uses a fixed **dark theme** (no light mode). All colors are defined as CSS variables in `src/app/globals.css`.

| Token | Value | Usage |
|---|---|---|
| `--background` | `#0a0e1a` | Page backgrounds |
| `--card` / `--htd-card` | `#111827` | Card backgrounds |
| `--htd-card-border` | `#2a2f3e` | Card/input borders |
| `--primary` / `--htd-purple` | `#7c3aed` | Primary actions, accents |
| `--htd-purple-light` | `#a78bfa` | Text accents, secondary highlights |
| `--htd-purple-dark` | `#5b21b6` | Hover states on purple elements |
| `--htd-green` | `#10b981` | Success states, delivery confirmed |
| `--muted-foreground` | `#94a3b8` | Labels, secondary text |

**Utility classes available:** `.gradient-text`, `.glow-purple`, `.glow-green`, `.glass-card`, `.bg-gradient-purple`, `.animated-border`, `.animate-float`

Always use these tokens/classes. Never hardcode colors in new components.

## Database Rules — CRITICAL

### Schema is defined in TWO places — ALWAYS update both

When making ANY change to the database schema (adding a table, adding/removing a column, changing a type, adding an index, modifying a constraint):

**1. Update `src/db/schema.ts`** (Drizzle ORM — TypeScript source of truth)
**2. Update `src/db/schema.sql`** (raw SQL mirror — used for reference and manual runs)

These two files must always be in sync. Never update one without updating the other.

### After any schema change, run:
```bash
npm run db:push     # pushes schema.ts changes directly to Neon (no migration files)
```
Or if using migrations:
```bash
npm run db:generate  # generates SQL migration files in /drizzle
npm run db:migrate   # applies pending migrations to Neon
```

### Adding a new table — checklist
- [ ] Add `pgTable(...)` definition in `src/db/schema.ts`
- [ ] Export `type MyTable = typeof myTable.$inferSelect` and `type NewMyTable = typeof myTable.$inferInsert`
- [ ] Add matching `CREATE TABLE IF NOT EXISTS ...` block in `src/db/schema.sql`
- [ ] Add any indexes to both files
- [ ] Run `npm run db:push`

### Adding a column — checklist
- [ ] Add the column to the `pgTable(...)` call in `src/db/schema.ts`
- [ ] Add `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` comment in `src/db/schema.sql`, then update the `CREATE TABLE` block to include it
- [ ] Run `npm run db:push`

### Removing a column — checklist
- [ ] Remove from `src/db/schema.ts`
- [ ] Remove from `CREATE TABLE` block in `src/db/schema.sql` and add a comment noting it was removed
- [ ] Run `npm run db:push` (Drizzle push will not auto-drop columns — run the DROP manually if needed)

## Key Patterns & Conventions

### Server Actions
All mutations go through Next.js Server Actions (files named `actions.ts`). They:
- Always call `auth()` first and return `{ error: "Unauthorized" }` if no session
- Return `{ error: string }` on failure or `{ success: true, ... }` on success
- Are never used directly in `use client` components for auth-sensitive ops

### Email sending (`src/app/d/[slug]/actions.ts`)
- Fetches the file buffer from R2 via `getFromR2()`
- Sends via Resend with `attachments: [{ filename, content: Buffer }]`
- Saves `resendEmailId` to `email_sends` so Resend webhooks can update the status
- Rate-limited to 3 attempts per email per hour (in-memory map)
- Simple regex email validation only: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Webhook flow
`/api/webhooks/resend` receives events → updates `email_sends.status` → the confirmation screen polls `/api/delivery-status?emailId=xxx` every 3 seconds to reflect the latest status to the user.

### Public landing pages (`/d/[slug]`)
- Always record a `document_views` row on page load (via server component)
- Must look stunning — use animated gradients, floating icons, grid patterns, glow effects
- Must stay within the HTD dark theme

## Environment Variables
All required env vars are in `.env.example`. For local dev, copy to `.env.local` and fill in values. Never commit `.env.local`.

| Variable | Used in |
|---|---|
| `DATABASE_URL` | `src/db/index.ts`, `drizzle.config.ts`, `src/db/seed.ts` |
| `AUTH_SECRET` | `src/lib/auth.ts` |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ACCOUNT_ID`, `R2_ENDPOINT` | `src/lib/r2.ts` |
| `RESEND_API_KEY` | `src/lib/resend.ts` |
| `RESEND_FROM_EMAIL` | `src/app/d/[slug]/actions.ts` |
| `RESEND_WEBHOOK_SECRET` | `src/app/api/webhooks/resend/route.ts` |
| `NEXT_PUBLIC_APP_URL` | Public URLs (shareable links) |
| `MAX_FILE_SIZE_MB` | Upload size limit (default: 25) |

## npm Scripts
```bash
npm run dev           # start dev server
npm run build         # production build
npm run db:generate   # generate Drizzle migration files from schema changes
npm run db:push       # push schema directly to Neon (no migration files)
npm run db:migrate    # apply pending migration files to Neon
npm run db:studio     # open Drizzle Studio (visual DB browser)
npm run db:seed       # seed the first admin account
```
