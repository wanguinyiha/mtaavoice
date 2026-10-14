# MtaaVoice

**Report it. Track it. Get it fixed.**

MtaaVoice is a community issue reporting and management platform that connects
citizens, administrators and field workers. Citizens report local problems
(potholes, broken streetlights, overflowing garbage, water leaks, blocked
drainage, and more), administrators review and assign them, field workers
document the work, and everyone tracks progress through resolution.

## Stack

- **Frontend:** Next.js 16 (App Router, Cache Components, Turbopack) + React 19 + TypeScript + Tailwind CSS 4
- **Backend:** [Convex](https://convex.dev) — schema, functions, reactive queries, file storage
- **Auth:** [Convex Auth](https://labs.convex.dev/auth) (`@convex-dev/auth`) with the Password provider (email + password)

## Getting started

```bash
npm install
npx convex dev        # pushes schema/functions and syncs env (keep running in a terminal)
npm run dev           # Next.js dev server at http://localhost:3000
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type-check the Next.js app |
| `npm run typecheck:convex` | Type-check Convex functions |
| `npx convex dev --once` | One-shot push of Convex schema/functions |
| `node scripts/verify-auth.mjs` | Auth smoke test (sign-up, sign-in, wrong-password, authz) |

## One-time setup

### 1. Seed categories and departments

```bash
npx convex run seed:seedBaseData
```

Creates the 11 issue categories and 6 departments (idempotent — safe to re-run).

### 2. Promote yourself to administrator

Sign up in the app first, then:

```bash
npx convex run admin:setUserRole '{"email":"you@example.com","role":"ADMIN"}'
```

For field workers, also pass a department:

```bash
npx convex run admin:setUserRole '{"email":"worker@example.com","role":"FIELD_WORKER","departmentId":"<departments id>"}'
```

Roles can never be changed by users through the app — only via this internal
mutation (Convex dashboard/CLI), which runs outside any user session.

### 3. Auth environment variables

`JWT_PRIVATE_KEY` and `JWKS` are set on the Convex deployment (plus
`SITE_URL`). If you need to rotate them, generate a fresh RS256 keypair with
`jose` and set both values together — they must match.

## Issue lifecycle

```
SUBMITTED → UNDER_REVIEW → ACCEPTED → ASSIGNED → IN_PROGRESS → RESOLVED
                    ↘ REJECTED (reason required)
                    ↘ DUPLICATE (link to original required)
```

Transitions are enforced server-side in `convex/issues.ts`:

- **Admins** review and disposition submitted reports.
- **Field workers** start and finish work on issues assigned to them.
- Citizens can only submit reports — never change status.

Every status change is recorded in `issueUpdates` (author, from/to, note,
timestamp) and notifies the reporter.

## Project structure

```
app/                  Next.js routes (landing, auth, dashboard, admin, field-worker)
components/           Shared UI (buttons, chips, badges, cards, toasts, issue cards)
convex/               Schema, auth, functions, seed, admin bootstrap
lib/                  Shared types, status maps, helpers
scripts/              verify-auth.mjs smoke test
```

## Development phases

1. ✅ Foundation: TypeScript migration, design system, landing page
2. ✅ Data & auth: Convex schema, Convex Auth, server-side authorization, seed
3. ⏳ Citizen MVP: dashboard, report submission, photos, location, report lists
4. ⏳ Administrator workflow: review, assignments, categories/departments
5. ⏳ Field-worker workflow: assignments, progress, evidence, resolution
6. ⏳ Notifications, maps, analytics
