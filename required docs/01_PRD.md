# HACKWAVE 2026 — Product Requirements Document (PRD)

**Version:** 1.0 (Phase 1 Scope)
**Status:** Ready for Development
**Owner:** HACKWAVE Organizing Committee

---

## 1. Product Overview

HACKWAVE 2026 is a long-term, two-phase hackathon:

- **Phase 1 (September):** Teams select a problem statement, build an initial solution, receive mentor guidance, and are evaluated by jury for shortlisting.
- **Phase 2 (January/February):** Shortlisted teams return with major improvements and are evaluated again for final results and awards.

**This document scopes Phase 1 only.** Phase 2 reuses the same system patterns (see Section 9 — Future Scope) but is not part of this build.

The HACKWAVE Portal is a role-based web platform connecting five user types — **Team, Mentor, Jury, Staff Coordinator, Admin** — through a shared project lifecycle: submission → mentor review → jury evaluation → results publication.

Team registration itself happens **outside** the platform (on the official HACKWAVE website). The platform begins after the organizing team verifies registrations and provisions accounts.

---

## 2. Goals

1. Give teams a single, structured place to submit their project and track feedback/results.
2. Give mentors a lightweight workspace to guide assigned teams without judging them.
3. Give jury members an independent, bias-free evaluation environment.
4. Give the Staff Coordinator full operational visibility and control over mentor/jury assignment, monitoring, and result publication.
5. Give the Admin full control over accounts, roles, permissions, and platform configuration.
6. Keep judging and mentoring strictly separated — mentors never see scores; jury never sees other jury scores, mentor feedback influence, or rankings.
7. Ensure every phase-bound record (submission, feedback, task, evaluation) is tagged by phase from day one, even though only Phase 1 is being built now — to avoid a data migration when Phase 2 begins.

## 3. Non-Goals (Out of Scope for this build)

- Certificates (explicitly removed from scope).
- Manual "announcement authoring" tool — announcements are auto-generated side effects of Coordinator publish actions, not a separate CMS.
- Phase 2 screens and workflows (structure is understood but not being built now).
- Payment processing, ticketing, or event logistics (venue, catering, swag).
- Public marketing website (this PRD only covers the authenticated portal system).

---

## 4. User Personas & Roles

| Role | Reports To | Primary Job | Judges? | Can Publish Results? |
|---|---|---|---|---|
| **Team** | Mentor (functionally) | Build and submit project, act on feedback | No | No |
| **Mentor** | Staff Coordinator | Guide assigned teams, give feedback, assign tasks | No | No |
| **Jury** | Staff Coordinator | Independently score assigned projects | Yes | No |
| **Staff Coordinator** | Admin | Run day-to-day hackathon operations, assign mentors/jury, publish all results | No | Yes |
| **Admin** | — | Manage accounts, roles, permissions, platform config, audit logs | No | No (operational publishing is Coordinator's job) |

---

## 5. Core Principles (Non-Negotiable)

1. **Mentors mentor, juries judge.** Mentors never see jury scores. Jury never sees other jury members' scores, mentor feedback's influence on scoring, or the leaderboard.
2. **Private Notes are Coordinator-only.** Mentor's confidential notes about a team are never visible to the team, other mentors, or jury.
3. **Evaluations lock on submission.** A submitted jury evaluation becomes read-only. Only the Staff Coordinator can reopen it (audited action).
4. **Results are gated by explicit publish actions.** Nothing (score, shortlist status, jury feedback) becomes visible to a team until the Staff Coordinator explicitly publishes it — even if the underlying data exists earlier.
5. **Winner/Runner-up/Second Runner-up are automatically derived** from final average score ranking — never manually assigned. Awards are the opposite: **always manually created and assigned** by the Coordinator, fully independent of ranking.
6. **No certificates.** Do not build any certificate generation, storage, or download feature.
7. **Announcements are not manually authored.** Each Coordinator publish action (Scores, Shortlist) automatically drives the corresponding "announcement" state in the team's Results Center. There is no separate announcement-writing tool.

---

## 6. Feature Requirements by Portal

### 6.0 Public Website & Registration (unauthenticated)

The HACKWAVE website is the public entry point and includes team registration directly — this is **in-scope** for this build, not an external tool.

**Registration Form** (public, no login): Team Name, Team Leader (Name, Roll Number, Phone, Email), Team Members (repeatable — Name, Roll Number, Phone), Institution/Department. Confirmation screen on submit; no account is created yet.

**Coordinator Registration Review** (inside the Coordinator Portal): list of submitted registrations by status (Pending Verification / Account Created / Rejected), with Approve / Reject actions. **Approving a registration automatically creates the Team's login account** — see Section 6.6 (Login Scheme) — no separate manual account-creation step.

The rest of the public website (About, Timeline, Tracks, Judges/Mentors, FAQ) is marketing content and does not require backend modeling beyond static/CMS-lite content — see the UI/UX Design Brief for the visual treatment.

### 6.6 Login Scheme (applies across all roles)

- **Username = Roll Number.** **Default password = `12345`.** Applies to Team (via registration approval), Mentor, Jury, and Coordinator accounts (via Admin creation). Admin accounts are set up with a distinct, stronger password, not the shared default.
- On first login (and after any Coordinator/Admin-triggered password reset), the user is forced into a **blocking "Change Your Password" modal** before reaching any dashboard content. They cannot skip or dismiss it.
- Password reset (forgotten password) is a Coordinator or Admin action that restores the account to `12345` + re-triggers the forced-change modal — no email-based self-service reset flow is required for this build.

### 6.1 Team Portal

**Project Submission Form** (single multi-section form, save-as-draft supported):

| Section | Field | Type | Required |
|---|---|---|---|
| 1. Project Details | Project Title | Text | Yes |
| | One-Liner | Textarea, max 150 chars, live counter | Yes |
| | Track Chosen | Single-select dropdown (14 options incl. "Others") | Yes |
| | Project Status | Radio: Ideation Complete / Research in Progress / Prototype Started / MVP Development Started | Yes |
| 2. Problem | Problem Statement | Rich text editor, guided prompts, recommended 150–400 words | Yes |
| 3. Solution | Proposed Solution | Rich text editor, guided prompts, recommended 200–500 words | Yes |
| | Target Users | Tag input (free tag + suggested examples) | Yes |
| 4. Planned Features | Core Features (Phase 1) | Dynamic repeatable list: title + short description | Yes (min 1) |
| | Future Enhancements (Phase 2) | Dynamic repeatable list: title + short description | No |
| 5. Tech Stack | Frontend / Backend / Database / AI-ML / Cloud-Deployment / Third-party APIs / Other | 7 separate tag inputs | At least one populated |
| 6. Solution Architecture | Upload | File (PNG/JPG/PDF/SVG, max 10MB) | Yes |
| 7. Mockup / Prototype | Upload | File (PNG/JPG/PDF) | No |
| | Prototype Link | URL (Figma/Adobe XD/Canva/Framer etc.) | No |
| 8. Potential Challenges | Textarea | Recommended 100–250 words | Yes |
| 9. References | Dynamic list | Title + URL, repeatable | No |
| 10. Demo Video | URL | YouTube / Loom / Google Drive | No |
| 11. Questions for Mentors | Large textarea | Free text | No |

**Submission Checklist** — displayed before submit button, auto-checks completed sections:
Problem Statement ✓ · Solution Explained ✓ · Features Listed ✓ · Tech Stack Added ✓ · Architecture Uploaded ✓ · Mockup Added (optional) · References Added (optional) · Mentor Questions Added (optional)

**Actions:** `Save as Draft` (secondary), `Submit for Review` (primary — locks editing until mentor feedback exists, per App Flow rules).

**Submission Success Screen:** Confirmation message + "What's Next" 4-step guide (see App Flow doc).

**Team Dashboard** — status banner that changes through the lifecycle:
- 🟡 Waiting for Mentor Review
- 📝 Complete the assigned mentor tasks before Phase 1
- 🎤 Ready for Phase 1 Evaluation
- Post-results states (score, shortlist status) — see Results Center

**Results Center** (Phase 1 scope only — no Winner/Runner-up/Awards yet, no Certificates):
- Phase 1 Score (locked until Coordinator publishes) — Final Average Score, Out of 100, Date Published
- Jury Feedback (locked until published) — Strengths / Areas for Improvement / Overall Comments
- Shortlisting Status (locked until Coordinator publishes) — 🏅 Shortlisted / ❌ Not Shortlisted / not yet announced

**View Mentor Feedback & Tasks** (separate from Results Center — available as soon as mentor submits):
- Mentor's Overall Feedback + Suggestions for Improvement (read-only)
- Assigned Tasks list with Title, Description, Priority, Due Date, Status (Pending/Completed) — team can mark tasks completed. Banner: "Complete these tasks before Phase 1 evaluation."

---

### 6.2 Mentor Portal

**Dashboard:** 4 summary cards (Assigned Teams, Submitted for Review, Reviewed, Recent Activities) + Recent Activities feed (assigned-team events only).

**Assigned Teams list:** cards showing Team Name, Project Title, Track, Team Leader, Submission Status, Last Updated. Click → Team Workspace.

**Team Workspace** (tabs/sections):
1. **View Project** — full read-only Devfolio-style rendering of the submission.
2. **View Contact Details** — Team Leader name/phone, Team Members + phones (for external WhatsApp coordination — not an in-app messaging feature).
3. **Feedback** — Overall Feedback (textarea) + Suggestions for Improvement (textarea). Auto-records Mentor Name, Date, Time on submit. Feedback is a **repeatable log** (mentors may leave feedback more than once, e.g. after a team acts on a task) — not a single overwritable record.
4. **Assign Tasks** — unlocked only after at least one feedback entry exists. Fields: Task Title, Description, Priority (Low/Med/High), Due Date. Team can mark task Pending → Completed. Tasks display to team with a "complete before Phase 1" framing.
5. **Private Notes** — confidential textarea, visible only to Staff Coordinator (never to the team or other mentors). Multiple notes allowed, each timestamped.

**Search & Filter:** by Team Name / Project Title; filter by Track, Submission Status, Review Status. Scoped to the mentor's own assigned teams only.

---

### 6.3 Jury Portal

**Dashboard:** 5 summary cards (Assigned Projects, Pending Evaluations, Completed Evaluations, Current Evaluation Phase, Recent Activities).

**Assigned Projects list:** Team Name, Project Title, Track, Evaluation Status. Actions: View Project, Start Evaluation.

**Project Details view** (read-only, Devfolio-style): Project Title, One-Liner, Track, Problem Statement, Proposed Solution, Target Users, Features, Tech Stack, Solution Architecture, Mockup/Prototype, Demo Video, GitHub Repo (optional field — see TRD note), Live Demo (optional field), Mentor Feedback (read-only, Overall Feedback + Suggestions only — **never** Private Notes).

**Evaluation Form** — 8 scoring criteria, 100 marks total:

| # | Criterion | Marks | Guiding Questions |
|---|---|---|---|
| 1 | Problem Understanding & Relevance | 10 | Clear real-world problem? Relevant/significant? Well-defined? |
| 2 | Innovation & Creativity | 15 | Original/innovative? Better than existing solutions? Creative thinking? |
| 3 | Technical Implementation | 20 | Appropriate tech? Well-designed architecture? Justified decisions? Good engineering practice? |
| 4 | Prototype Functionality | 20 | Functions as demonstrated? Core features work? Stable/usable? Solves the problem? |
| 5 | UI/UX & User Experience | 10 | Clean/intuitive? Smooth journey? Visually appealing/accessible? |
| 6 | Scalability & Feasibility | 10 | Scalable? Practical to implement? Future enhancements feasible? Long-term potential? |
| 7 | Presentation & Demo | 10 | Presented clearly/confidently? Demo successful? Explained decisions? Answered questions well? |
| 8 | Impact & Future Potential | 5 | Meaningful impact? Genuine need? Production-ready potential? Life beyond hackathon? |

Plus: **Strengths** (textarea), **Areas for Improvement** (textarea), **Overall Comments** (textarea). **Total Score** auto-calculated (sum of the 8 criteria, out of 100), read-only.

**Submission behavior:** autosave-as-draft while scoring is in progress (per-criterion); on final `Submit Evaluation`, the entire form locks. Jury can only view their own submitted evaluation afterward, never other jury scores or the leaderboard.

**Hard rule:** Jury must never see mentor scores (mentors don't score — see PRD 5.1), other jury scores, rankings, or the leaderboard, at any point in the UI.

---

### 6.4 Staff Coordinator Portal

**Dashboard:** 7 summary cards (Total Teams, Total Mentors, Teams Submitted for Review, Teams Reviewed, Pending Reviews, Tasks Pending, Tasks Completed) + Recent Activities feed (platform-wide).

**Mentor Mapping:** Assign mentor to team(s), assign multiple teams at once, reassign, remove assignment, view per-mentor workload (e.g., "Mentor A → 8 Teams").

**Jury Mapping:** Same pattern as Mentor Mapping — assign/reassign/remove jury-to-project assignments, view per-jury workload. *(This is a Coordinator action, not just an Admin one-time setup — jury assignment needs to be re-adjustable throughout Phase 1.)*

**Team Management:** view all teams — Team Name, Project Title, Track, Assigned Mentor, Submission Status, Review Status. Actions: View Project, View Mentor, View Tasks, View Feedback.

**Mentor Monitoring:** per mentor — Assigned Teams, Teams Reviewed, Pending Reviews, Tasks Assigned, Last Active.

**Jury Monitoring:** per jury — Assigned Projects, Evaluations Completed, Pending Evaluations, Last Active. *(Mirrors Mentor Monitoring — needed for the same operational visibility.)*

**Review Monitoring:** all teams by status (Not Submitted / Submitted / Under Review / Reviewed), quick filters.

**Task Monitoring:** all mentor-assigned tasks — Team, Mentor, Task Title, Due Date, Status; filters Pending/Completed/Overdue.

**Private Mentor Notes (viewer):** Team, Mentor, Date, Note — Coordinator-only visibility.

**Teams Without Activity widget:** surfaces teams that (a) haven't submitted yet, (b) haven't responded to mentor feedback, or (c) haven't completed any task in the last 7–14 days — lets the Coordinator intervene early. Same inactivity pattern should also flag idle mentors (teams pending review with zero feedback given in 3+ days) and idle jury (assigned evaluations un-started as deadline approaches).

**Reopen Jury Evaluation:** Coordinator-only action to unlock a submitted (locked) jury evaluation for correction. Must be audited (who reopened, when, why — free-text reason field recommended).

**Leaderboard (Coordinator-only view until published):** Rank, Team Name, Project Title, Average Jury Score, Evaluation Status. Auto-updates as evaluations complete.

**Publish Actions** (Phase 1 scope):
- **Publish Phase 1 Scores** — unlocks Phase 1 Score + Jury Feedback in every team's Results Center.
- **Publish Shortlisted Teams** — unlocks Shortlisting Status in every team's Results Center; shortlisted teams see a congratulatory banner.

*(Publish Final Results, Publish Awards exist in the data model / permission matrix for future Phase 2 use, but are not part of the Phase 1 build — see Section 9.)*

**Search & Filters:** Team Name, Project Name, Mentor Name; filter by Track, Mentor, Submission Status, Review Status, Task Status.

---

### 6.5 Admin Portal

**Dashboard:** Total Users, Total Teams, Total Mentors, Total Coordinators, Total Jury Members, Active Hackathon, Pending User Approvals + Recent Activities.

**User Management:** Create/Edit/Deactivate/Delete/Reset Password for all user types (Team accounts, Mentor, Staff Coordinator, Jury, Admin). Display Name, Email, Phone, Role, Status, Last Login.

**Team Management:** create/edit/remove team account records (post-registration, pre-verified externally) — Team Name, Project Title, Track, Team Leader, Team Members, Institution, Assigned Mentor, Status.

**Mentor / Coordinator / Jury Management:** create/edit/activate/deactivate accounts; assign teams (mentor) or projects (jury) — *note: ongoing reassignment during the event is a Coordinator action (6.4); Admin's assignment action here is for initial pool setup.*

**Hierarchy Management:** read-only visual (Admin → Coordinators → {Mentors → Teams, Jury}) confirming the reporting structure; only Admin can restructure it.

**Role & Permission Management:** per-role toggle of platform capabilities (see Section 7 — Permission Matrix). Changes take effect immediately.

**Access Control:** grant/revoke access, change roles, enable/disable accounts.

**Audit Logs:** immutable log of all administrative actions — User, Action, Date & Time, IP (optional). Includes Coordinator's "Reopen Evaluation" actions and all publish actions for traceability.

**Platform Settings:** Hackathon Name, Logo, Banner, Registration Status (Open/Closed — informational, since registration itself is external), Submission Deadline, Phase 1 Review Window, Evaluation Window, Announcement Banner.

**Authentication & Security:** password reset, optional MFA, account lock/unlock, session management.

**Notification Management:** platform-wide broadcast notifications by recipient group (All / Teams / Mentors / Coordinators / Jury) — distinct from the Results Center's auto-generated publish announcements; this is for operational broadcasts (e.g., "Phase 1 evaluation schedule released").

**System Health:** Active Users, Total Logins, Storage Usage, Database Status, Email Delivery Status.

---

## 7. Permission Matrix

| Feature | Team | Mentor | Jury | Staff Coordinator | Admin |
|---|---|---|---|---|---|
| View Own Team Submission | ✅ | ✅ (assigned only) | ✅ (assigned only) | ✅ | ✅ |
| Submit Mentor Feedback | ❌ | ✅ | ❌ | ✅ | ❌ |
| Assign Tasks | ❌ | ✅ | ❌ | ✅ | ❌ |
| View Mentor Private Notes | ❌ | Own only | ❌ | ✅ | ❌ |
| Submit Jury Evaluation | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Other Jury Scores | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Leaderboard (pre-publication) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Assign/Reassign Mentors | ❌ | ❌ | ❌ | ✅ | ✅ (initial setup) |
| Assign/Reassign Jury | ❌ | ❌ | ❌ | ✅ | ✅ (initial setup) |
| Reopen Jury Evaluation | ❌ | ❌ | ❌ | ✅ | ❌ |
| Publish Phase 1 Scores | ❌ | ❌ | ❌ | ✅ | ❌ |
| Publish Shortlisted Teams | ❌ | ❌ | ❌ | ✅ | ❌ |
| Create/Manage User Accounts | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configure Roles & Permissions | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Published Results (own) | ✅ | ✅ (assigned, own view) | ❌ | ✅ | ✅ |

---

## 8. Success Metrics

- 100% of registered/provisioned teams able to submit before deadline without support tickets related to form confusion.
- Mentors submit feedback for 100% of assigned teams before the mentor-review window closes.
- All jury evaluations submitted and locked before the Coordinator's publish deadline.
- Zero incidents of a jury member seeing another jury's score, or a mentor seeing jury scores, or a team seeing unpublished results.
- Coordinator can identify and act on an inactive team at least 3 days before a deadline (via the Teams Without Activity widget).

---

## 9. Future Scope (Not Built Now — Noted for Data Model Compatibility)

Phase 2 follows the **same pattern** as Phase 1: resubmission (with improvements) → mentor review round → jury evaluation → Coordinator publishes Phase 2 Scores → **Publish Final Results** (Winner/Runner-up/Second Runner-up auto-derived from Phase 2 leaderboard) → **Publish Awards** (manually created, independent of ranking). The Results Center gains a second timeline block for Phase 2 outcomes, with Phase 1 history remaining visible.

Because of this, every phase-bound entity in the Backend Schema is built with a `phase` field from the start, even though only `phase = 1` records are populated in this build. This avoids a schema migration when Phase 2 development begins.
