# HACKWAVE 2026 — Implementation Plan

**Version:** 1.0 (Phase 1 Scope)
**Audience:** Code Agent / Development Team

This plan sequences the build so that every milestone produces a testable, demoable slice — no milestone depends on unfinished work from a later milestone.

---

## Milestone 0 — Project Setup

- Initialize repo, TypeScript config, linting/formatting.
- Set up Next.js app with Tailwind, Plus Jakarta Sans font loaded.
- Set up PostgreSQL + Prisma, apply the schema from `05_BACKEND_SCHEMA.md` (including `rollNo`, `mustChangePassword`, `registrationStatus`).
- Set up custom credentials auth (rollNo + password) with the 5 roles and role-based route middleware.
- Build the **Forced Change Password modal** as a shared, reusable gate — check `mustChangePassword` immediately after every successful login, before any dashboard route renders.
- Seed script: 1 Admin (custom strong password), 1 Coordinator, 2 Mentors, 3 Jury members (all seeded with hashed `12345` + `mustChangePassword = true`), 5 sample Teams with varying submission states.
- Deploy a blank "hello world" per role dashboard to staging to confirm the auth/role pipeline — including the forced password change step — works end-to-end before building real features.

**Exit criteria:** Can log in as each of the 5 roles using rollNo/`12345`, get forced through the Change Password modal on first login, and land on a role-correct (even if empty) dashboard on subsequent logins.

---

## Milestone 1 — Public Website (Registration) + Admin Portal

Build these together since Admin needs registrations to exist in order to manage the pipeline, and the public site needs nowhere to send people until Admin/Coordinator tooling exists to process them.

1. **Public Registration Form** (unauthenticated route) — Team Name, Leader (Name/Roll No/Phone/Email), Members (repeatable), Institution. Submits to `POST /api/register`, creates `Team` with `registrationStatus = PENDING_VERIFICATION`. Confirmation screen on success.
2. **Public marketing pages** (About, Timeline, Tracks, Judges/Mentors, FAQ, Contact) — static content per the UI/UX Design Brief; can be built in parallel by a separate contributor since it has no backend dependency beyond the registration form itself.
3. Admin — User Management: Create/Edit/Deactivate/Delete/Reset Password for Mentor, Jury, Coordinator, Admin roles (rollNo + default `12345` pattern, except Admin).
4. Admin — Role & Permission Management (server-side enforcement per `01_PRD.md` §7 regardless of whether the editing UI is dynamic or hardcoded initially).
5. Audit Log (write-only from other modules for now; build the viewer here).
6. Platform Settings singleton screen.

**Exit criteria:** A test registration submitted through the public form appears correctly as `PENDING_VERIFICATION`; Admin can independently provision Mentor/Jury/Coordinator accounts that can log in and complete the forced password change.

---

## Milestone 1a — Coordinator: Registration Review

(Pulled out from the main Coordinator Portal milestone since it needs to exist before teams can log in at all.)

1. Registrations list — filter by status (Pending / Account Created / Rejected), search by team name.
2. **Approve** action — auto-creates the `User` row (rollNo = leader's roll number, hashed `12345`, `mustChangePassword = true`), sets `registrationStatus = ACCOUNT_CREATED`.
3. **Reject** action — reason field, logged to Audit.

**Exit criteria:** A Coordinator can approve a real public-form submission and the resulting Team account can immediately log in with rollNo/`12345` and get forced through the password change modal.

---

## Milestone 2 — Team Portal: Submission

1. Build the 11-section submission form exactly per `01_PRD.md` Section 6.1, with:
   - Save-as-Draft (autosave every 30s + manual button)
   - Field validation matching required/optional table
   - File upload to object storage for Architecture (required) and Mockup (optional)
   - Submission Checklist component, live-updating
2. Submit-for-Review flow: server-side validation, lock on success, Submission Success Screen.
3. Team Dashboard shell with the status banner state machine (`🟡 → 📝 → 🎤`).

**Exit criteria:** A seeded Team account can complete, save, and submit a full project; submission appears correctly in the database with `status = SUBMITTED`.

---

## Milestone 3 — Mentor Portal

1. Dashboard (4 summary cards + recent activity feed, scoped to assigned teams).
2. Assigned Teams list + Team Workspace shell (tabs: Project / Contact / Feedback / Tasks / Private Notes).
3. View Project tab — read-only render of the Milestone 2 submission (Devfolio-style layout).
4. View Contact Details tab.
5. Feedback tab — submit, log display (repeatable entries).
6. Assign Tasks tab — gated behind ≥1 feedback entry; CRUD for tasks; team-facing task status will be wired in Milestone 4.
7. Private Notes tab — confidential, Coordinator-visible-only (verify with a test: log in as a second mentor or as the team and confirm 403/empty).

**Exit criteria:** A Mentor can review a real submitted project, leave feedback, and assign a task; a Coordinator test-account can see the Private Note but a Team test-account cannot.

---

## Milestone 4 — Team Portal: Feedback & Tasks (closes the loop with Milestone 3)

1. Team-side Feedback Log view (read-only).
2. Team-side Task list with Mark Complete toggle.
3. Team Dashboard status transitions to `📝 Complete the assigned mentor tasks before Phase 1` once feedback exists.

**Exit criteria:** Full Team ⇄ Mentor loop works end-to-end: submit → mentor feedback → mentor task → team completes task → mentor sees status update.

---

## Milestone 5 — Coordinator Portal: Assignment & Monitoring

1. Dashboard (7 summary cards + recent activity).
2. Mentor Mapping (assign/reassign/remove + workload view).
3. Jury Mapping (same pattern, for projects).
4. Team Management table (with drill-in actions: View Project/Mentor/Tasks/Feedback).
5. Mentor Monitoring + Jury Monitoring views.
6. Review Monitoring + Task Monitoring with filters.
7. Private Mentor Notes viewer.
8. Teams Without Activity widget (query: no submission OR no feedback response OR no task completion in last 7–14 days — make the window configurable).
9. Search & Filters across Team Name / Project Name / Mentor Name, Track, Submission Status, Review Status, Task Status.

**Exit criteria:** Coordinator can assign every seeded team to a mentor and every seeded project to jury members, and monitor progress accurately as Milestones 3–4 data changes.

---

## Milestone 6 — Jury Portal

1. Dashboard (5 summary cards).
2. Assigned Projects list.
3. Project Details read-only view (including Mentor Feedback — text-only, verify Private Notes are never included in this payload).
4. Evaluation Form: 8 criteria with live-summing Total Score, Strengths/Areas/Comments, autosave draft.
5. Submit Evaluation → lock, confirmation modal, post-submit read-only "receipt" rendering.
6. Verify cross-jury isolation: seed 2+ jury members on the same project, confirm neither can see the other's evaluation or a combined average anywhere in the Jury Portal.

**Exit criteria:** Multiple jury members can independently score the same project; scores never leak between them in the UI or API.

---

## Milestone 7 — Coordinator Portal: Reopen & Publish

1. Reopen Evaluation action (with required reason field, writes to Audit Log).
2. Leaderboard view (Coordinator/Admin only) — auto-calculates `averageScore` from submitted evaluations, live.
3. Publish Phase 1 Scores action (confirmation modal, idempotent, writes Audit Log, sets `LeaderboardEntry.scoresPublishedAt`).
4. Publish Shortlisted Teams action (same pattern, sets `ShortlistDecision.publishedAt` per team).

**Exit criteria:** Coordinator can reopen a locked jury evaluation, see it get resubmitted, watch the leaderboard update, and publish — with the correct visibility change firing for teams (tested in Milestone 8).

---

## Milestone 8 — Team Portal: Results Center

1. Results Center shell with the three Phase 1 sections: Phase 1 Score, Jury Feedback, Shortlisting Status.
2. Locked-state placeholders exactly matching copy in `03_APP_FLOW.md` Section 2.5, shown until the corresponding publish flag is set.
3. Shortlisted / Not Shortlisted banner variants.
4. End-to-end test: as Coordinator, publish scores → confirm Team account sees Phase 1 Score + Jury Feedback appear without a page-hard-refresh being required to notice the change (poll or refetch-on-navigation is sufficient — real-time push is not required).

**Exit criteria:** The full Phase 1 lifecycle is demoable start to finish with real seeded accounts: Admin provisions → Team submits → Mentor reviews/tasks → Jury evaluates → Coordinator publishes → Team sees results.

---

## Milestone 9 — Hardening Pass

1. Re-verify every row in the Permission Matrix (`01_PRD.md` Section 7) with an actual cross-role API test — not just UI click-through.
2. Confirm file upload validation (type + size) is enforced server-side, not just via the `accept` attribute.
3. Confirm all publish/reopen actions are idempotent and logged.
4. Accessibility pass: keyboard navigation, focus states, `aria-live` on form errors, `prefers-reduced-motion` respected.
5. Responsive pass on all 5 portals at 360px, 768px, 1024px, 1440px.
6. Load a realistic dataset (50+ teams, 10+ mentors, 5+ jury) into staging and confirm dashboard aggregate queries and paginated lists perform acceptably.

**Exit criteria:** Staging environment survives a full dry-run event simulation with the organizing committee.

---

## Explicit Non-Goals for This Build (Do Not Implement)

- Certificates (generation, storage, download).
- Manual announcement-authoring tool for the Coordinator.
- Team self-registration/signup flow.
- Phase 2 screens (Publish Final Results, Publish Awards UI, Winner/Runner-up display) — schema fields exist for future compatibility but no UI should be built against them yet.
- Real-time chat or in-app messaging between mentors and teams.
- Public-facing marketing site.

---

## Suggested Build Order Rationale

Admin → Team Submission → Mentor → Team Feedback Loop → Coordinator Monitoring → Jury → Coordinator Publish → Team Results → Hardening.

This order ensures every milestone can be manually tested against real data produced by the previous milestone, rather than requiring mocked stand-ins for portals that don't exist yet.
