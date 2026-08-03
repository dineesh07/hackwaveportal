# HACKWAVE 2026 — Technical Requirements Document (TRD)

**Version:** 1.0 (Phase 1 Scope)
**Audience:** Development / Code Agent

---

## 1. Assumed Tech Stack

These are recommended defaults. If your environment already has a mandated stack, substitute accordingly — the rest of this document (schema, API contracts, RBAC) is stack-agnostic in structure.

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | Next.js 14+ (React, TypeScript) | App Router; server components for read-heavy pages, client components for interactive forms |
| Styling | Tailwind CSS | Matches design tokens in UI/UX Design Brief |
| Font | Plus Jakarta Sans | Self-hosted or Google Fonts, `font-display: swap` |
| Backend | Next.js API routes OR a separate Node.js/Express service | Either is acceptable; keep all business logic in a service layer, not in route handlers, so it's portable |
| Database | PostgreSQL | Relational integrity matters here (teams↔mentors↔evaluations↔scores) |
| ORM | Prisma | Schema-first, migrations, good TypeScript inference |
| Auth | Custom credentials-based session (JWT or server session) | Role-based session; no self-service signup for login purposes — accounts are provisioned via the Registration → Coordinator Approval flow (Team) or Admin creation (Mentor/Jury/Coordinator). See Section 2.1a for the specific login scheme. |
| File storage | S3-compatible bucket (AWS S3 / Cloudflare R2 / Supabase Storage) | For architecture diagrams, mockups; 10MB max per PDF skill guidance already noted |
| Rich text editor | Tiptap or Lexical | For Problem Statement / Proposed Solution fields |
| Email | Resend / SendGrid / SES | For password resets, notification broadcasts |
| Hosting | Vercel (frontend+API) + managed Postgres (Neon/Supabase/RDS) | Or containerized on any cloud provider |

---

## 2. Non-Functional Requirements

### 2.1a Login Scheme (Simplified, Roll-Number-Based)

Deliberately simple, department-scale auth — not a generic email/password or OAuth flow:

- **Username = Roll Number** (unique per student; unique per Mentor/Jury/Coordinator via an equivalent staff ID if not a roll number).
- **Default password = `12345`** for every account at creation time, regardless of role.
- **`mustChangePassword` boolean flag** on `User` (see Backend Schema §2.1), defaulted to `true` on creation.
- **Forced Change Password modal:** on any login where `mustChangePassword === true`, the user is redirected into a blocking modal/screen *immediately after authentication succeeds* — before they see any dashboard, nav, or portal content. They cannot dismiss it or navigate away without successfully setting a new password. On success, `mustChangePassword` flips to `false` and they proceed to their normal role-based dashboard.
- **Password requirements:** keep genuinely simple (e.g., minimum 6 characters, must differ from `12345`) — this is a low-stakes internal event tool, not a banking app; don't over-engineer complexity rules that create support tickets.
- **Still hash passwords server-side** (bcrypt/argon2) even though the default is a shared, publicly-known value — never store `12345` or any subsequent password in plaintext, and never log raw passwords anywhere (including server logs or the Audit Log's `metadata` field).
- **Rate-limit login attempts** per username regardless of the simplified scheme — a guessable default password makes basic brute-force protection more important, not less.
- This login scheme applies uniformly to **Team, Mentor, Jury, and Coordinator** accounts (all created via provisioning, none via public self-signup). Admin accounts should still use a stronger, separately-set password at creation time given their platform-wide access — do not default Admin accounts to `12345`.

### 2.1 Security
- All routes behind authentication except the login page itself.
- **Role-based access control (RBAC) enforced server-side on every API route** — never rely on frontend hiding alone. A Jury user hitting a Mentor-only endpoint directly must receive a 403, not just a hidden button.
- Passwords hashed with bcrypt/argon2; never stored or logged in plaintext.
- Session tokens expire; support forced logout on account deactivation (Admin action must immediately invalidate active sessions).
- File uploads validated by MIME type and size server-side (not just accept="" on the input) — reject anything outside PNG/JPG/PDF/SVG for architecture, PNG/JPG/PDF for mockups, max 10MB.
- Rate-limit login attempts; lock account after N failed attempts (configurable in Admin > Platform Settings).
- All Coordinator "Reopen Evaluation" and all "Publish" actions must be logged to the immutable audit trail with actor, timestamp, and (for reopen) a reason field.

### 2.2 Data Integrity & Isolation
- **Strict visibility boundaries enforced at the query layer, not just the UI:**
  - Jury queries must never join against other jury members' `JuryEvaluation` rows for the same project.
  - Jury queries must never expose `MentorPrivateNote`.
  - Mentor queries must never expose `JuryEvaluation` or `LeaderboardEntry` data.
  - Team queries must never expose unpublished `LeaderboardEntry`, unpublished `JuryEvaluation`, or any `MentorPrivateNote`.
- Every phase-bound table includes a `phase` integer column (`1` for this build). All list/detail queries for phase-bound entities must filter by phase, even though only phase 1 exists now — this is what makes Phase 2 additive rather than a migration.

### 2.3 Performance
- Dashboard summary cards (counts) should be computed via indexed aggregate queries, not client-side iteration over full record sets.
- Paginate all list views (Assigned Teams, Team Management, Task Monitoring, Audit Logs) — do not return unbounded result sets.
- File uploads should upload directly to object storage (pre-signed URL pattern) rather than routing binary through the app server.

### 2.4 Availability & Reliability
- Autosave drafts (Team project submission form, Jury evaluation in progress) at minimum every 30 seconds or on field blur — network interruption must not lose in-progress work.
- Publish actions (Publish Scores, Publish Shortlist) should be idempotent — re-clicking after a network hiccup must not double-fire notifications or corrupt state.

### 2.5 Accessibility
- All interactive elements keyboard-navigable with visible focus states.
- Form validation errors announced via `aria-live` regions, not color alone.
- Respect `prefers-reduced-motion` for any transition/animation.

### 2.6 Responsiveness
- All five portals must be usable on mobile viewports (≥360px width) — coordinators and mentors will likely check status on their phones during the event.

---

## 3. Field-Level Data Gaps to Resolve at Build Time

These were identified during spec review and must be explicitly decided (not left ambiguous) before building the affected screens:

1. **GitHub Repository** and **Live Demo URL** fields appear in the Jury Portal's Project Details view but are not in the Team submission form. **Resolution: add both as optional URL fields to Section 7 (Mockup/Prototype) of the Team submission form**, so the Jury Portal has real data to display.
2. **Mentor Feedback visible to Jury** = only `MentorFeedback.overallFeedback` + `MentorFeedback.suggestions`. It must **never** include `MentorPrivateNote` records. Enforce this as a separate, distinct query/endpoint — do not reuse the Coordinator's "view all mentor output" endpoint for the Jury Portal.
3. **Winner/Runner-up/Second Runner-up** are computed, not stored as manual input — derive from `LeaderboardEntry.rank` at read-time (or cache at publish-time) for ranks 1–3. Do not build a UI for manually assigning these titles.
4. **Awards** are fully manual and independent of rank — no automatic linkage between `Award` and `LeaderboardEntry`.
5. **No certificate entity, table, or endpoint** — confirmed out of scope.
6. **No `Announcement` authoring table/UI** — the Results Center's "announcement" text is derived directly from the four publish-timestamp fields already on `LeaderboardEntry`/`ShortlistDecision` (see Backend Schema). Do not build a separate CMS-style announcements feature for the Coordinator.

---

## 4. Environments

| Environment | Purpose |
|---|---|
| `development` | Local dev, seeded with fake teams/mentors/jury for testing evaluation flows |
| `staging` | Pre-event dry run — organizing committee tests full Phase 1 flow end-to-end before real teams onboard |
| `production` | Live event |

Seed data for `development`/`staging` should include: 3 tracks worth of sample teams, at least 2 mentors with overlapping team assignments, at least 3 jury members assigned to the same project (to test average calculation and lock behavior), and one Admin/Coordinator account each.

---

## 5. API Design Principles

- RESTful resource-oriented routes, namespaced by role where access differs, e.g.:
  - `GET /api/team/submission` (team's own)
  - `GET /api/mentor/teams/:teamId` (mentor's assigned team only — 403 if not assigned)
  - `GET /api/jury/projects/:projectId` (jury's assigned project only — 403 if not assigned)
  - `GET /api/coordinator/leaderboard` (Coordinator/Admin only)
- All mutating endpoints (`POST`/`PATCH`/`DELETE`) that change publish state or lock state must be logged to `AuditLog`.
- Return consistent error shapes: `{ error: { code, message } }` — never leak internal stack traces to the client.

---

## 6. Out of Scope (Explicit)

- Certificates — not built.
- Manual announcement authoring — not built.
- Team self-registration — external, not built.
- Phase 2 screens — not built (schema is phase-aware, screens are not).
- Real-time chat/WhatsApp integration — mentor-team contact is via displayed phone numbers only, communication happens outside the platform.
