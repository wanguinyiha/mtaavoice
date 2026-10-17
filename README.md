# MtaaVoice

**Report it. Track it. Get it fixed.**

MtaaVoice is a community issue reporting and management platform that connects
citizens, administrators and field workers. Citizens report local problems
(potholes, broken streetlights, overflowing garbage, water leaks, blocked
drainage, and more), administrators review and assign them, field workers
document the work with evidence photos, and everyone tracks progress through
resolution — with notifications and a community map of open reports.

## Stack

- **Frontend:** Next.js 16 (App Router, Cache Components, Turbopack) + React 19 + TypeScript + Tailwind CSS 4 + Leaflet (community map)
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
| `node scripts/verify-workflow.mjs` | Full E2E: citizen reports → admin reviews/assigns → worker evidences/resolves (20 checks, incl. negative authz) |

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

Transitions are enforced server-side in `convex/lib/transitions.ts` and
mirrored client-side in `lib/transitions.ts` (UI only ever renders legal
buttons; the server rejects any spoofed move):

- **Admins** review and disposition submitted reports, then assign a
  department (and optionally a specific field worker).
- **Field workers** start work, upload **evidence photos** (badged in the
  gallery), and resolve with a note.
- Citizens can only submit reports — never change status.

Every status change is recorded in `issueUpdates` (author, from/to, note,
timestamp) and notifies the reporter. Assignments notify the worker; evidence
uploads notify the reporter.

## Routes

| Area | Routes |
| --- | --- |
| Public | `/` landing, `/login`, `/register` |
| Citizen | `/dashboard`, `/report`, `/reports`, `/reports/[id]` |
| Admin | `/admin`, `/admin/queue`, `/admin/reports`, `/admin/reports/[id]`, `/admin/departments` |
| Field worker | `/field-worker`, `/field-worker/assignments`, `/field-worker/assignments/[id]` |
| Shared (any signed-in role) | `/profile`, `/notifications`, `/map` |

Every area is wrapped in a client `AuthGate` **and** re-checked in every Convex
function — hiding UI is never the security boundary.

## Project structure

```
app/                  Next.js routes, grouped by role: (citizen), (admin), (field-worker), (account), (auth)
components/
  ui/                 Design system (buttons, inputs, chips, dialogs, toasts, badges…)
  issues/             IssueCard, StatusTimeline, shared IssueDetailView
  admin/              IssueActions (review/assign dialogs)
  field/              WorkerActions (start/evidence/resolve)
  layout/             AppHeader (role-aware nav), NotificationsBell, SiteHeader
  map/                IssueMap (Leaflet, status-colored markers)
convex/               Schema, auth, functions, seed, admin bootstrap
lib/                  Status/priority maps, transitions mirror, nav helpers, hooks
scripts/              verify-auth + verify-workflow smoke tests
```

## Features by area

- **Citizen:** stats dashboard, report form (category/priority chips, ≤5 photos,
  GPS state machine with manual-location fallback), My Reports with filters,
  detail with ✓/○ timeline + update feed, profile/sign-out.
- **Admin:** dashboard with live counts, review queue (start review / accept /
  reject with reason / mark duplicate), assignment dialog (department + worker),
  all-reports browse with status filters + search, department directory with
  worker/assignment counts.
- **Field worker:** personal queue (Open/All/Resolved), start work, evidence
  photo uploads, resolve with note.
- **Everyone:** notifications bell with unread badge, notifications center
  (mark read / mark all), community map of open reports with role-aware
  deep links.

## Development phases

- ✅ **Phase 2** — Foundation: TypeScript migration, design system, MtaaVoice landing page
- ✅ **Phase 3** — Data & auth: Convex schema, Convex Auth, server-side authorization, seed data
- ✅ **Phase 4** — Citizen MVP: dashboard, report submission with photos/GPS, report lists, detail timeline, profile
- ✅ **Phase 5** — Administrator MVP: review queue, accept/reject/duplicate, assignment, departments, admin dashboard
- ✅ **Phase 6** — Field worker MVP: assignments, start/resolve flow, evidence photo uploads, E2E workflow test
- ✅ **Phase 7** — Notifications & map: bell + unread badge, notifications center, Leaflet community map
- ✅ **Phase 8** — Polish & E2E: error boundary on session lapse, README, full verification sweep
