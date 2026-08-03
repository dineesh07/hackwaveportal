# HACKWAVE 2026 — UI/UX Design Brief

**Version:** 1.0
**Brand basis:** HACKWAVE IGNITE logo (black wordmark, red "A" + flame icon, angled red/orange ribbon)

---

## 1. Design Principles for This Product

This is a **multi-role operational dashboard system**, not a marketing site. The design should prioritize scan-ability, clear status communication, and fast task completion over visual flourish. The one place we spend "boldness" is the status ribbon component (Section 5) — everything else stays disciplined, squared-off, and quiet.

---

## 2. Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#1A1A1A` | Primary text, nav, headers (not pure black — matches logo's near-black) |
| `--paper` | `#FAFAF9` | App background |
| `--surface` | `#FFFFFF` | Cards, panels, modals |
| `--flame-red` | `#E8283F` | Primary accent — primary buttons, active nav state, critical status |
| `--flame-orange` | `#FF6B35` | Secondary accent — warnings, "in progress" states |
| `--flame-gold` | `#FFC94A` | Tertiary accent — highlights, "pending" badges |
| `--line` | `#E4E2DD` | Borders, dividers (warm gray, not cold gray) |
| `--success` | `#1F9254` | Confirmations (e.g., "Task Completed", "Submitted") — outside the flame palette on purpose, so success doesn't compete visually with the brand accent |
| `--danger` | `#C81E3A` | Destructive actions (Delete, Deactivate) — distinct from `--flame-red` by being slightly darker/desaturated so brand-red buttons and error-red aren't confusable |

**Status gradient** (red → orange → gold) is reserved specifically for **progress indicators** — e.g., a thin bar under dashboard summary cards, or a submission-completeness meter. Do not use the gradient decoratively elsewhere; its meaning should stay consistent (progress/momentum).

---

## 3. Typography

- **Body / UI face:** Plus Jakarta Sans — weights 400 (body text), 500 (labels, table headers), 600 (emphasis, active nav items). Used for *everything*, including scores, IDs, and timestamps — no separate mono/data face.
- **Display face:** Plus Jakarta Sans 800 (ExtraBold), uppercase, letter-spacing -0.02em — used only for page titles and section headers (e.g., "TEAM WORKSPACE", "ASSIGNED PROJECTS").
- **Numeric emphasis without a font switch:** scores, counts, and IDs use `font-variant-numeric: tabular-nums` plus a step up in weight (600) relative to their label, so they read as "data" without introducing a second typeface.

### Type Scale

| Role | Size | Weight | Case |
|---|---|---|---|
| Page title | 28px / 1.75rem | 800 | UPPERCASE |
| Section header | 20px / 1.25rem | 700 | UPPERCASE |
| Card title | 16px | 600 | Sentence case |
| Body text | 15px | 400 | Sentence case |
| Label / caption | 13px | 500 | Sentence case |
| Data emphasis (scores, counts) | matches context, +100 weight | 600 | tabular-nums |

---

## 4. Layout System

- **Grid:** 12-column, max content width 1280px, 24px gutters. Sidebar nav (240px) + main content area for desktop; collapsible bottom/hamburger nav for mobile (<768px).
- **Radius:** 4–6px only (or 0 on ribbon/badge components) — the logo's angled-cut aesthetic doesn't pair with heavily rounded corners.
- **Spacing scale:** 4px base unit — 4/8/12/16/24/32/48/64.
- **Cards:** 1px `--line` border, no drop shadow by default (flat, sticker-like); use a 2px shadow only on hover/interactive cards to signal clickability.

### Dashboard Summary Card Pattern (signature layout moment)

```
┌──────────────────────┐
│ ASSIGNED TEAMS        │  ← label, 13px/500/uppercase, --ink at 60% opacity
│ 12                    │  ← 32px/700, tabular-nums, --ink
│ ▓▓▓▓▓▓░░░░░░          │  ← 3px progress bar, red→orange→gold gradient
└──────────────────────┘
```

---

## 5. Signature Element — Status Ribbon

Reuse the logo's angled "IGNITE" ribbon shape as a **recurring status badge component** across all portals — this is the one shape borrowed directly from the brand mark, used deliberately and sparingly:

- Diagonal-cut rectangle (not a rounded pill), red-to-orange gradient fill, white uppercase text, small size (fits inline in a table row or card corner).
- Used for: "Shortlisted", "Under Review", "Published", "Reopened", "Overdue".
- Neutral statuses (e.g., "Draft", "Not Submitted", "Pending") use a plain outlined tag in `--ink` at low opacity — **not** the ribbon — so the ribbon stays reserved for meaningful, "hot" state changes and doesn't get diluted into generic tagging.

---

## 6. Component Notes by Portal

### Team Portal
- Multi-section submission form: use a persistent left-hand step tracker (Section 1 → 11) with checkmarks as sections complete — reduces anxiety on a long form.
- Character counters (One-Liner) and word-range hints (Problem Statement, Solution, Challenges) shown as small live-updating captions below the field, turning `--danger` only if drastically over range, not a hard block.
- Locked Results Center sections render as a dimmed card with a lock icon and the exact placeholder copy from the App Flow doc — never just hide the card entirely, so teams know the feature exists and when to check back.

### Mentor Portal
- Team Workspace tabs (Project / Contact / Feedback / Tasks / Private Notes) — Tasks tab visibly disabled (grayed, tooltip "Submit feedback first") until unlocked, rather than hidden, so mentors understand the sequence.
- Private Notes tab gets a small lock icon + caption "Only visible to Staff Coordinator" directly in the UI — reassures mentors this is confidential without them needing to ask.

### Jury Portal
- Evaluation form: one criterion per row/card with the marks-out-of-X and helper questions directly beside the score input (not in a separate tooltip) — jury should never have to hunt for the rubric while scoring.
- Total Score shown as a sticky live-updating footer bar while scoring, so jury always sees the running total before submitting.
- Post-submit, the entire form re-renders in a read-only "receipt" style (grayed inputs, no edit affordance) — reinforces that it's locked, not just disabled.

### Coordinator Portal
- Leaderboard table only ever appears inside the Coordinator/Admin shell — never expose this component to any other role even in a stripped-down form, to avoid any accidental data leakage risk in shared component code.
- Publish actions (Publish Scores, Publish Shortlist) require a confirmation modal stating exactly what becomes visible and to whom — no silent one-click irreversible actions.
- "Teams Without Activity" widget uses `--flame-orange` accents (warning-adjacent, not `--danger`) since it's advisory, not an error state.

### Admin Portal
- Audit Log table is dense, monospaced-feeling via tabular-nums + smaller 13px size, sortable by column — this is the one place information density trumps whitespace, since it's a reference/debugging tool, not a daily-use dashboard.

---

## 7. States to Design for Every List/Table

- **Empty state:** plain-language, action-oriented copy (e.g., "No teams assigned yet. Contact your coordinator." not "No data available").
- **Loading state:** skeleton cards matching the final layout shape — avoid spinners for list content.
- **Error state:** explain what happened and what to do, in the interface's voice ("Couldn't load your teams. Try refreshing." not "Error 500").

---

## 8. Accessibility & Motion

- All ribbon/badge color-coding must be paired with text, never color alone.
- Focus states: 2px `--flame-red` outline offset 2px, visible on every interactive element.
- Motion limited to: page-load fade-in (150ms), tab-switch cross-fade (100ms), progress-bar fill animation on dashboard load. Respect `prefers-reduced-motion` by disabling all of the above for users who request it.
