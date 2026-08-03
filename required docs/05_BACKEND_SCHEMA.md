# HACKWAVE 2026 — Backend Schema

**Version:** 1.0 (Phase 1 Scope, Phase-aware fields included)
**Format:** Prisma-style schema (adapt syntax to your ORM of choice — the shape is what matters)

---

## 1. Entity Relationship Overview

```
User (1) ──< (M) MentorAssignment >── (M) Team
User (1) ──< (M) JuryAssignment  >── (M) Project

Team (1) ── (1) Project        [a team has one project per phase]
Project (1) ──< (M) MentorFeedback
Project (1) ──< (M) MentorPrivateNote
Project (1) ──< (M) Task
Project (1) ──< (M) JuryEvaluation
Project (1) ── (1) LeaderboardEntry   [derived/cached per phase]
Project (1) ──< (M) AuditLog (indirectly, via actions referencing it)

Team (1) ──< (M) TeamMember
Award (M) ──< >── (M) Project   [many-to-many via AwardRecipient]
```

**Key modeling decision:** `phase` is an integer field (`1` for this build) present on `Project`, `MentorFeedback`, `Task`, `JuryEvaluation`, `LeaderboardEntry`, and `ShortlistDecision`. This means a team's Phase 2 resubmission is a **new** `Project` row (same `teamId`, `phase = 2`), not an edit to the Phase 1 row — preserving full history in the Results Center.

---

## 2. Core Entities

### 2.1 User

```prisma
model User {
  id                 String   @id @default(cuid())
  name               String
  rollNo             String   @unique   // login username for Team/Mentor/Jury/Coordinator; Admin may use a separate scheme
  email              String?  @unique   // optional for Team accounts, useful for credential delivery where available
  phone              String?
  passwordHash       String   // hash of "12345" at creation time for non-Admin roles; Admin set individually
  mustChangePassword Boolean  @default(true)  // forces the Change Password modal on next login; false for Admin-created-with-custom-password accounts if desired
  role               Role     // TEAM | MENTOR | JURY | COORDINATOR | ADMIN
  status             Status   @default(ACTIVE) // ACTIVE | INACTIVE | LOCKED
  lastLoginAt        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // role-specific optional profile fields
  organization  String?  // Jury: org; Mentor: department/org
  expertise     String?  // Jury only

  mentorAssignments MentorAssignment[] @relation("MentorUser")
  juryAssignments   JuryAssignment[]   @relation("JuryUser")
  teamMembership    TeamMember[]       // if TEAM-role login is per-member; see note below
}

enum Role {
  TEAM
  MENTOR
  JURY
  COORDINATOR
  ADMIN
}

enum Status {
  ACTIVE
  INACTIVE
  LOCKED
}
```

> **Note on Team login:** recommend one login account per **team** (not per member), owned conceptually by the Team Leader, since the portal treats "Team" as a single actor submitting one project. Team Members are stored as data (contact info) under `TeamMember`, not as separate login-capable `User` rows, unless you specifically want individual member logins — not specified in the brief, so default to single team account.

### 2.2 Team

```prisma
model Team {
  id                  String   @id @default(cuid())
  teamName            String
  institution         String?
  leaderName          String
  leaderRollNo        String            // becomes the login username once account is created
  leaderPhone         String
  leaderEmail         String?
  userId              String?  @unique  // null until account is created; set on approval
  registrationStatus  RegistrationStatus @default(PENDING_VERIFICATION)
  registeredAt        DateTime @default(now())
  verifiedAt          DateTime?
  verifiedBy          String?           // coordinator userId
  status              Status   @default(ACTIVE)
  createdAt           DateTime @default(now())

  members             TeamMember[]
  projects            Project[]          // one per phase
  mentorAssignments   MentorAssignment[]
}

enum RegistrationStatus {
  PENDING_VERIFICATION  // submitted via public website, awaiting Coordinator review
  VERIFIED              // Coordinator approved, account not yet created (transient/optional state)
  ACCOUNT_CREATED        // login credentials generated (rollNo / default "12345"), team can log in
  REJECTED               // duplicate, invalid, or fraudulent entry — kept for audit, not deleted
}

model TeamMember {
  id      String @id @default(cuid())
  teamId  String
  team    Team   @relation(fields: [teamId], references: [id])
  name    String
  phone   String
  email   String?
}
```

### 2.3 Project (the Phase submission)

```prisma
model Project {
  id                 String   @id @default(cuid())
  teamId             String
  team               Team     @relation(fields: [teamId], references: [id])
  phase              Int      @default(1)

  // Section 1
  projectTitle       String
  oneLiner           String   @db.VarChar(150)
  track              Track
  projectStatus      ProjectStatus

  // Section 2 & 3
  problemStatement   String   @db.Text   // rich text HTML/JSON
  proposedSolution   String   @db.Text
  targetUsers        String[]            // tag list

  // Section 4
  coreFeatures       Feature[] @relation("CoreFeatures")
  futureEnhancements Feature[] @relation("FutureEnhancements")

  // Section 5
  techFrontend       String[]
  techBackend        String[]
  techDatabase       String[]
  techAiMl           String[]
  techCloud          String[]
  techApis           String[]
  techOther          String[]

  // Section 6
  architectureFileUrl String

  // Section 7
  mockupFileUrl       String?
  prototypeLinkUrl    String?
  githubRepoUrl       String?    // added per TRD gap resolution
  liveDemoUrl         String?    // added per TRD gap resolution

  // Section 8
  potentialChallenges String @db.Text

  // Section 9
  references          Reference[]

  // Section 10
  demoVideoUrl         String?

  // Section 11
  questionsForMentors  String? @db.Text

  status              SubmissionStatus @default(DRAFT) // DRAFT | SUBMITTED | UNDER_REVIEW | REVIEWED
  submittedAt         DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  mentorFeedback      MentorFeedback[]
  privateNotes        MentorPrivateNote[]
  tasks               Task[]
  juryAssignments     JuryAssignment[]
  juryEvaluations     JuryEvaluation[]
  leaderboardEntry    LeaderboardEntry?
  awards              AwardRecipient[]

  @@unique([teamId, phase])
}

model Feature {
  id          String @id @default(cuid())
  title       String
  description String
  coreForProjectId    String?
  futureForProjectId  String?
  core        Project? @relation("CoreFeatures", fields: [coreForProjectId], references: [id])
  future      Project? @relation("FutureEnhancements", fields: [futureForProjectId], references: [id])
}

model Reference {
  id        String  @id @default(cuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id])
  title     String
  url       String
}

enum Track {
  ARTIFICIAL_INTELLIGENCE
  WEB_DEVELOPMENT
  MOBILE_DEVELOPMENT
  HEALTHCARE
  EDUCATION
  AGRICULTURE
  SUSTAINABILITY
  FINTECH
  CYBERSECURITY
  OPEN_INNOVATION
  IOT
  BLOCKCHAIN_WEB3
  CLOUD_COMPUTING
  OTHERS
}

enum ProjectStatus {
  IDEATION_COMPLETE
  RESEARCH_IN_PROGRESS
  PROTOTYPE_STARTED
  MVP_DEVELOPMENT_STARTED
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  REVIEWED
}
```

### 2.4 Mentor Assignment & Feedback

```prisma
model MentorAssignment {
  id        String @id @default(cuid())
  mentorId  String
  mentor    User   @relation("MentorUser", fields: [mentorId], references: [id])
  teamId    String
  team      Team   @relation(fields: [teamId], references: [id])
  phase     Int    @default(1)
  assignedAt DateTime @default(now())

  @@unique([mentorId, teamId, phase])
}

model MentorFeedback {
  id               String   @id @default(cuid())
  projectId        String
  project          Project  @relation(fields: [projectId], references: [id])
  mentorId         String
  phase            Int      @default(1)
  overallFeedback  String   @db.Text
  suggestions      String   @db.Text
  createdAt        DateTime @default(now())
  // Mentor Name resolved via mentorId -> User at query time; Date/Time = createdAt
}

model MentorPrivateNote {
  id         String   @id @default(cuid())
  projectId  String
  project    Project  @relation(fields: [projectId], references: [id])
  mentorId   String
  phase      Int      @default(1)
  note       String   @db.Text
  createdAt  DateTime @default(now())
  // VISIBILITY: Coordinator + Admin only. Never returned by Team, Mentor(other), or Jury queries.
}

model Task {
  id          String     @id @default(cuid())
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id])
  mentorId    String
  phase       Int        @default(1)
  title       String
  description String
  priority    Priority
  dueDate     DateTime
  status      TaskStatus @default(PENDING)
  createdAt   DateTime   @default(now())
  completedAt DateTime?
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum TaskStatus {
  PENDING
  COMPLETED
}
```

### 2.5 Jury Assignment & Evaluation

```prisma
model JuryAssignment {
  id         String   @id @default(cuid())
  juryId     String
  jury       User     @relation("JuryUser", fields: [juryId], references: [id])
  projectId  String
  project    Project  @relation(fields: [projectId], references: [id])
  phase      Int      @default(1)
  assignedAt DateTime @default(now())

  @@unique([juryId, projectId, phase])
}

model JuryEvaluation {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  juryId      String
  phase       Int      @default(1)

  scoreProblemUnderstanding Int  // /10
  scoreInnovation           Int  // /15
  scoreTechnicalImpl        Int  // /20
  scorePrototypeFunc        Int  // /20
  scoreUiUx                 Int  // /10
  scoreScalability           Int  // /10
  scorePresentation          Int  // /10
  scoreImpactPotential       Int  // /5
  totalScore                 Int // computed = sum of above, denormalized for read speed

  strengths            String  @db.Text
  areasForImprovement  String  @db.Text
  overallComments      String  @db.Text

  status       EvaluationStatus @default(DRAFT) // DRAFT | SUBMITTED
  submittedAt  DateTime?
  reopenedAt   DateTime?         // set when Coordinator reopens
  reopenReason String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([projectId, juryId, phase])
}

enum EvaluationStatus {
  DRAFT
  SUBMITTED
}
```

**Validation rule:** each score field must not exceed its max (10/15/20/20/10/10/10/5). Enforce server-side, not just in the client form.

### 2.6 Leaderboard, Shortlisting, Results Publication

```prisma
model LeaderboardEntry {
  id             String   @id @default(cuid())
  projectId      String   @unique
  project        Project  @relation(fields: [projectId], references: [id])
  phase          Int      @default(1)
  averageScore   Float    // computed = avg(totalScore) across all SUBMITTED JuryEvaluations for this project+phase
  rank           Int?     // computed at publish time (or live, but only shown to Coordinator pre-publish)
  scoresPublishedAt DateTime?   // null = not yet published to teams
  updatedAt      DateTime @updatedAt
}

model ShortlistDecision {
  id              String   @id @default(cuid())
  projectId       String   @unique
  phase           Int      @default(1)
  isShortlisted   Boolean
  publishedAt     DateTime?  // null = not yet visible to team
  decidedBy       String     // coordinator userId
  decidedAt       DateTime   @default(now())
}
```

> **Winner / Runner-up / Second Runner-up:** NOT a stored field. Derive at read-time (or cache at Final-Results-publish-time, if built in Phase 2) as `rank <= 3` mapped to a label. No dedicated table.

### 2.7 Awards (fully manual, independent of ranking — future-facing but modeled now for schema completeness)

```prisma
model Award {
  id           String   @id @default(cuid())
  title        String
  description  String
  icon         String?
  phase        Int      @default(1)
  publishedAt  DateTime?
  createdBy    String   // coordinator userId
  createdAt    DateTime @default(now())

  recipients   AwardRecipient[]
}

model AwardRecipient {
  id         String  @id @default(cuid())
  awardId    String
  award      Award   @relation(fields: [awardId], references: [id])
  projectId  String
  project    Project @relation(fields: [projectId], references: [id])
}
```

### 2.8 Audit Log

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  actorId     String   // userId who performed the action
  action      String   // e.g. "PUBLISH_PHASE1_SCORES", "REOPEN_EVALUATION", "CREATE_USER"
  targetType  String?  // e.g. "Project", "JuryEvaluation", "User"
  targetId    String?
  metadata    Json?    // free-form context, e.g. { reason: "..." }
  ipAddress   String?
  createdAt   DateTime @default(now())
}
```

### 2.9 Platform Settings (singleton)

```prisma
model PlatformSettings {
  id                    String   @id @default("singleton")
  hackathonName         String
  logoUrl               String?
  bannerUrl             String?
  registrationOpen      Boolean  @default(false)
  submissionDeadline    DateTime?
  phase1ReviewWindowStart DateTime?
  phase1ReviewWindowEnd   DateTime?
  evaluationWindowStart   DateTime?
  evaluationWindowEnd     DateTime?
  announcementBanner    String?
}
```

---

## 3. Visibility Rules (Enforce at Query/Service Layer)

| Data | Visible To |
|---|---|
| `Project` full detail | Owning Team; assigned Mentor(s); assigned Jury (minus GitHub/Live Demo restrictions — none, those are visible); Coordinator; Admin |
| `MentorFeedback` | Owning Team (read-only); authoring Mentor; assigned Jury (read-only, feedback text only); Coordinator; Admin |
| `MentorPrivateNote` | Coordinator; Admin **only** — never Team, never any Mentor other than none (not even the author sees it differently — still Coordinator-only per spec), never Jury |
| `Task` | Owning Team (can update status); authoring Mentor; Coordinator; Admin |
| `JuryEvaluation` (own) | Authoring Jury member (own submission only, read-only after submit); Coordinator; Admin |
| `JuryEvaluation` (others') | Coordinator; Admin only — never visible to other Jury members or Mentors |
| `LeaderboardEntry` (pre-publish) | Coordinator; Admin only |
| `LeaderboardEntry` (post-publish) | + owning Team (own entry only, not the full leaderboard, unless a public leaderboard feature is explicitly built later) |
| `ShortlistDecision` (pre-publish) | Coordinator; Admin only |
| `ShortlistDecision` (post-publish) | + owning Team |
| `AuditLog` | Admin only |

---

## 4. API Endpoint Reference (Representative, not exhaustive)

### Public (Unauthenticated)
- `POST /api/register` — public team registration form submission (creates a `Team` row with `registrationStatus = PENDING_VERIFICATION`, no `User` yet)

### Auth
- `POST /api/auth/login` — accepts `{ rollNo, password }`; response includes `mustChangePassword` flag so the frontend can force the modal before rendering any dashboard
- `POST /api/auth/change-password` — sets new password, flips `mustChangePassword` to `false`
- `POST /api/auth/logout`
- `POST /api/auth/reset-password` — Admin/Coordinator-triggered reset back to default `12345` + `mustChangePassword = true`, for a student who forgets their changed password

### Team
- `GET /api/team/project` — own project (current phase)
- `PUT /api/team/project` — save draft
- `POST /api/team/project/submit` — validate + lock + set status SUBMITTED
- `GET /api/team/feedback` — feedback log (read-only)
- `GET /api/team/tasks` / `PATCH /api/team/tasks/:id` — mark complete
- `GET /api/team/results` — locked/unlocked Results Center payload

### Mentor
- `GET /api/mentor/teams` — assigned teams
- `GET /api/mentor/teams/:teamId` — team workspace detail (403 if not assigned)
- `POST /api/mentor/teams/:teamId/feedback`
- `POST /api/mentor/teams/:teamId/tasks` (403 if zero feedback entries exist)
- `POST /api/mentor/teams/:teamId/notes`

### Jury
- `GET /api/jury/projects` — assigned projects
- `GET /api/jury/projects/:id` — project detail (403 if not assigned)
- `PUT /api/jury/evaluations/:projectId` — save draft
- `POST /api/jury/evaluations/:projectId/submit` — lock

### Coordinator
- `GET /api/coordinator/registrations` — list teams by `registrationStatus`, with search/filter
- `POST /api/coordinator/registrations/:teamId/approve` — verifies the team, auto-creates the `User` account (rollNo as username, hashed `12345` as password, `mustChangePassword = true`), sets `registrationStatus = ACCOUNT_CREATED`
- `POST /api/coordinator/registrations/:teamId/reject` — sets `registrationStatus = REJECTED` (body: `{ reason }`, logged to Audit)
- `GET /api/coordinator/leaderboard`
- `POST /api/coordinator/mentor-assignments`
- `DELETE /api/coordinator/mentor-assignments/:id`
- `POST /api/coordinator/jury-assignments`
- `DELETE /api/coordinator/jury-assignments/:id`
- `POST /api/coordinator/evaluations/:id/reopen` (body: `{ reason }`)
- `POST /api/coordinator/publish/scores`
- `POST /api/coordinator/publish/shortlist`
- `GET /api/coordinator/teams-without-activity`

### Admin
- `POST /api/admin/users` / `PATCH /api/admin/users/:id` / `DELETE /api/admin/users/:id`
- `POST /api/admin/teams` / `PATCH /api/admin/teams/:id`
- `PATCH /api/admin/permissions`
- `GET /api/admin/audit-logs`
- `PATCH /api/admin/settings`

---

## 5. Derived/Computed Values (Do Not Store Redundantly Where Avoidable)

- `LeaderboardEntry.averageScore` — recompute whenever a `JuryEvaluation` for that project moves to `SUBMITTED`, or on reopen/resubmit. Store denormalized for read speed, but always recompute from source `JuryEvaluation.totalScore` values, never hand-edit.
- Winner/Runner-up/Second Runner-up labels — derive from `rank` at render time.
- Submission Checklist (Team form) — compute client-side + re-validate server-side at submit time; not stored as a separate table.
