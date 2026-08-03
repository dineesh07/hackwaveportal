# HACKWAVE 2026 — App Flow Document

**Version:** 1.0 (Phase 1 Scope)

This document describes every user-facing flow, screen-to-screen, with state transitions. Use it alongside the Backend Schema to know what state changes on each action.

---

## 1. Global Flow — Registration, Provisioning, and Login

### 1.1 Team Registration (public, on the HACKWAVE website — same platform, unauthenticated route)

```
[HACKWAVE Website: Registration Form] (public, no login required)
    Team Name, Team Leader (Name/Roll No/Phone/Email), Members (repeatable),
    Institution/Department
        │
        ▼
[Submit] → Team row created, registrationStatus = PENDING_VERIFICATION
        │  Confirmation screen: "Registration received. You'll be notified
        │  once verified."
        ▼
[Coordinator Portal → Registrations tab]
    Coordinator reviews pending registrations
        │
        ├── [Reject] → registrationStatus = REJECTED (reason logged)
        │
        └── [Approve] → registrationStatus = ACCOUNT_CREATED
                │  System auto-generates login: username = Team Leader's Roll No,
                │  password = "12345" (hashed), mustChangePassword = true
                ▼
            Team can now log in — credentials communicated via whatever
            channel the Coordinator chooses (announced in class, displayed
            on the Registrations tab for the Coordinator to relay, etc.)
```

Mentor, Jury, and Coordinator accounts are still provisioned directly by the Admin (Admin Portal → User Management), using the same rollNo/`12345`/`mustChangePassword` pattern for consistency — only Team accounts originate from the public registration form.

### 1.2 Login & Forced Password Change

```
[Login Screen] → enter Roll No + Password
        │
        ▼
Auth succeeds → check mustChangePassword
        │
        ├── true  → BLOCKING "Change Your Password" modal
        │           (cannot be dismissed or navigated away from)
        │               │
        │               ▼
        │           New password submitted → mustChangePassword = false
        │               │
        │               ▼
        └── false ──────┴──→ role-based redirect to dashboard:
                              ├── Team        → Team Dashboard
                              ├── Mentor      → Mentor Dashboard
                              ├── Jury        → Jury Dashboard
                              ├── Coordinator → Coordinator Dashboard
                              └── Admin       → Admin Dashboard
```

**Forgotten password:** Coordinator or Admin can trigger `POST /api/auth/reset-password`, which resets the account back to default `12345` and sets `mustChangePassword = true` again — same forced-change flow repeats on next login.

---

## 2. Team Flow

### 2.1 First Login → Submission

```
Team Dashboard (status: 🟡 no submission yet)
        │
        ▼
[Start Project Submission] → Multi-section form (Sections 1–11)
        │
        ├── [Save as Draft] → returns to Dashboard, status stays "Draft in progress"
        │                     form remains editable, autosaves every 30s
        │
        └── [Submit for Review] → validation runs against Submission Checklist
                │
                ├── If required sections incomplete → inline errors, submission blocked
                │
                └── If complete → Submission locks (read-only for team)
                                   Status → 🟡 Waiting for Mentor Review
                                   Success Screen shown (see 2.2)
```

**Editing after submission:** the submission is locked once submitted. If a team needs to make changes, this is only possible via a mentor-triggered "reopen for edits" mechanic OR by the team submitting fresh Q&A through "Questions for Mentors" — **for Phase 1, treat the submission as final at submit time**; do not build an edit-after-submit path unless the Coordinator confirms this is needed operationally.

### 2.2 Submission Success Screen

Displays:
> 🎉 Submission Received! Thank you for submitting your project for the HACKWAVE 2026 Pre-Phase 1 Review. Your project will now be reviewed by our mentors...

What's Next steps shown: 1) Await mentor feedback → 2) Refine based on suggestions → 3) Develop MVP for Phase 1 → 4) Present at Phase 1 evaluation.

### 2.3 Post-Submission Dashboard States

```
Status: 🟡 Waiting for Mentor Review
        │  (mentor submits at least one Feedback entry)
        ▼
Status: 📝 Complete the assigned mentor tasks before Phase 1
        │  team can view Feedback tab (read-only) + Tasks tab (mark complete)
        │  (Coordinator/event timeline reaches Phase 1 evaluation window)
        ▼
Status: 🎤 Ready for Phase 1 Evaluation
        │  (jury evaluations happen — team sees no change yet, results are unpublished)
        ▼
Status: (unchanged until Coordinator publishes)
        │  Coordinator clicks "Publish Phase 1 Scores"
        ▼
Results Center: Phase 1 Score + Jury Feedback unlock
        │  Coordinator clicks "Publish Shortlisted Teams"
        ▼
Results Center: Shortlisting Status unlocks
        │
        ├── Shortlisted → banner: "🏅 Shortlisted for Phase 2 — await further instructions"
        └── Not Shortlisted → banner: thank-you / encouragement message
```

### 2.4 Team — Viewing Feedback & Tasks (ongoing, independent of Results Center)

```
Team Dashboard → [View Mentor Feedback]
        │
        ▼
Feedback Log (chronological, read-only)
    - each entry: Mentor Name, Date/Time, Overall Feedback, Suggestions

Team Dashboard → [My Tasks]
        │
        ▼
Task List (from mentor)
    - Title, Description, Priority, Due Date, Status
    - [Mark Complete] toggle → Status: Pending → Completed
    - banner reminder: "Complete these before Phase 1 evaluation"
```

### 2.5 Team — Results Center Locked States

Before any publish action, each Results Center section independently shows a locked placeholder:
- Phase 1 Score → "Results have not been published yet."
- Jury Feedback → (bundled with score publish — same gate)
- Shortlisting Status → "Shortlisting results have not been announced yet."

---

## 3. Mentor Flow

```
Mentor Dashboard (Assigned Teams / Submitted for Review / Reviewed / Recent Activities)
        │
        ▼
[Assigned Teams list] → click a team card
        │
        ▼
Team Workspace
        │
        ├── [View Project] — read-only submission view
        │
        ├── [View Contact Details] — leader + members, phone numbers
        │
        ├── [Feedback tab]
        │       │
        │       ▼
        │   Fill Overall Feedback + Suggestions → [Submit Feedback]
        │       │
        │       ▼
        │   Feedback entry saved (Mentor Name/Date/Time auto-recorded)
        │       │
        │       ▼
        │   "Assign Tasks" tab UNLOCKS (was disabled/hidden before first feedback)
        │
        ├── [Assign Tasks tab] (only after ≥1 feedback entry exists)
        │       │
        │       ▼
        │   [+ Add Task] → Title, Description, Priority, Due Date → Save
        │       │
        │       ▼
        │   Task appears in team's task list with status "Pending"
        │       │  (team marks complete on their side)
        │       ▼
        │   Mentor sees status update to "Completed" in Team Workspace
        │
        └── [Private Notes tab]
                │
                ▼
            Free text entries, timestamped, visible ONLY to Staff Coordinator
            (mentor can add multiple notes over time; not visible to team)
```

**Re-submitting feedback:** mentors can return to the Feedback tab and add a **new** log entry at any time (e.g., after reviewing a completed task) — feedback is additive, not a single overwritable field.

---

## 4. Jury Flow

```
Jury Dashboard (Assigned Projects / Pending / Completed / Current Phase / Recent Activities)
        │
        ▼
[Assigned Projects list] → [View Project] or [Start Evaluation]
        │
        ▼
Project Details (read-only, Devfolio-style)
    includes: Mentor Feedback (Overall Feedback + Suggestions ONLY — never Private Notes)
        │
        ▼
[Start Evaluation] → Evaluation Form
        │
        ├── Score each of 8 criteria (auto-sums to Total Score, live)
        ├── Fill Strengths / Areas for Improvement / Overall Comments
        ├── Autosaves as draft while in progress
        │
        └── [Submit Evaluation]
                │
                ▼
        Confirmation prompt: "Once submitted, this evaluation cannot be edited.
                               Continue?"
                │
                ▼
        Evaluation LOCKS (read-only)
        Jury Dashboard: Pending Evaluations -1, Completed Evaluations +1
        Jury can view own submitted evaluation only — no visibility into
        other jury scores, averages, or leaderboard, at any point.
```

**Reopen path (Coordinator-triggered only):**
```
Coordinator Portal → [Reopen Evaluation] on a specific jury+project pair
        │
        ▼
Evaluation unlocks for that jury member only
        │  (Coordinator must provide a reason — logged to Audit Log)
        ▼
Jury re-edits → [Submit Evaluation] again → re-locks
```

---

## 5. Staff Coordinator Flow

### 5.1 Mentor & Jury Mapping

```
Coordinator Portal → Mentor Mapping
        │
        ▼
[Select Mentor] → [Assign Multiple Teams] / [Reassign] / [Remove Assignment]
        │
        ▼
Workload view updates live (Mentor A → 8 Teams, etc.)

(Same pattern for Jury Mapping → Assign/Reassign/Remove projects per jury member)
```

### 5.2 Monitoring

```
Coordinator Portal → Review Monitoring / Task Monitoring / Mentor Monitoring / Jury Monitoring
        │
        ▼
Filterable tables/cards — read-only, drill into Team Management for detail
        │
        ▼
Teams Without Activity widget surfaces at-risk teams (no submission /
no response to feedback / no task completion in 7–14 days)
```

### 5.3 Publish Sequence (Phase 1)

```
All jury evaluations for a project submitted
        │
        ▼
Leaderboard auto-calculates: Final Score = average(all submitted jury scores)
        │  (Coordinator-only visibility at this stage)
        ▼
Coordinator reviews Leaderboard
        │
        ▼
[Publish Phase 1 Scores]
        │  → confirmation modal: "This will make scores visible to all teams. Continue?"
        │  → AuditLog entry created
        ▼
Every team's Results Center: Phase 1 Score + Jury Feedback unlock immediately
        │
        ▼
Coordinator reviews shortlist criteria, marks teams as shortlisted (internal flag)
        │
        ▼
[Publish Shortlisted Teams]
        │  → confirmation modal
        │  → AuditLog entry created
        ▼
Every team's Results Center: Shortlisting Status unlocks
Shortlisted teams' dashboards show congratulatory banner
```

---

## 6. Admin Flow

```
Admin Dashboard
        │
        ▼
User Management → [Create User] → select Role (Team/Mentor/Coordinator/Jury/Admin)
        │           → fill Name/Email/Phone → account created, status "Active"
        │           → (credentials delivery via email or Notification Management)
        │
        ▼
Team Management → [Create Team] (post external-registration verification)
        │           → Team Name, Project Title placeholder, Track, Leader, Members,
        │             Institution, initial Mentor assignment
        │
        ▼
Role & Permission Management → toggle capabilities per role → takes effect immediately
        │
        ▼
Audit Logs → immutable, searchable by User / Action / Date
```

---

## 7. Cross-Cutting Rule Summary (for QA / Test Cases)

| Rule | Must Verify |
|---|---|
| Jury cannot see other jury scores | API + UI test: Jury A's session cannot fetch Jury B's evaluation for the same project |
| Jury cannot see leaderboard | 403 on any leaderboard endpoint for Jury role |
| Mentor cannot see jury scores | 403 on evaluation endpoints for Mentor role |
| Private Notes hidden from team & other mentors | Team session and other-mentor session both get 403/empty on Private Notes endpoint |
| Results hidden before publish | Team session gets locked-placeholder response until `LeaderboardEntry.publishedAt` (or equivalent) is set |
| Evaluation locks after submit | PATCH to a submitted evaluation returns 403 unless Coordinator has issued a reopen |
| Task tab hidden until first feedback | Mentor UI/API blocks task creation if zero Feedback entries exist for that team |
