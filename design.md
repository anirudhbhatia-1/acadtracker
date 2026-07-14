# 🎨 Design Document
## Student Academic Management Platform

---

**Document Version:** 1.1
**Date:** July 14, 2026
**Status:** Draft — Awaiting Design Review
**Related Docs:** PRD_Student_Academic_Platform v1.1 · architecture.md v1.1 · rules.md v1.1
**Audience:** Design, Frontend Engineering, QA

---

## 1. Purpose & Scope

The PRD defines **what** the platform must do. The architecture document defines **how** it's built. This document defines **how it looks, feels, and behaves** — the visual language, component specifications, and screen-level layouts that frontend engineers implement inside the React + Tailwind + shadcn/ui stack described in `architecture.md`.

Every token, component, and screen spec here is implementable with the stack already chosen: **Tailwind CSS**, **shadcn/ui**, **Recharts**, **React Big Calendar**, **React Hook Form + Zod**, **React Hot Toast**, **lucide-react** icons.

---

## 2. Design Principles

| Principle | What it means here |
|---|---|
| **Calm, not alarming** | Attendance and grade data can trigger real anxiety. Status colors inform, they don't shout. Critical states use solid color sparingly — in badges and icons, never as full-bleed backgrounds. |
| **Numbers are first-class citizens** | SGPA, CGPA, and attendance % are the product. They get their own type treatment (tabular, monospaced) so they're always scannable and never mistaken for body text. |
| **One glance, one answer** | Every card answers exactly one question: *Am I safe on attendance? What's my CGPA? What's due today?* No card mixes concerns. |
| **The record is the interface** | Students are literally tracking a personal academic ledger. The visual language borrows from gradebooks and attendance registers — not generic dashboard chrome. |
| **Admin ≠ Student, visually** | Both roles share a design system, but the admin surface reads denser and more tabular (data-management tone), while the student surface reads lighter and more encouraging (progress-tracking tone). |

---

## 3. Design Tokens

### 3.1 Color System

Core brand palette — 4 named colors, used deliberately and sparingly:

| Token | Hex | Usage |
|---|---|---|
| `ink` (primary) | `#2B3A67` | Primary actions, active nav, headers, links |
| `chalk-teal` (accent) | `#2E8B8B` | Secondary actions, highlights, predictor/graph accents |
| `paper` (light surface) | `#F3F4F7` | App background (light mode) — cool, not cream |
| `deep-ink` (dark surface) | `#14161F` | App background (dark mode) |

> Deliberately avoided: warm cream + terracotta and near-black + acid-green palettes — both read as generic AI-template defaults. This palette leans cool and academic (ink, chalk, paper) to match the subject matter.

Semantic status colors — **fixed by PRD §8.3 (FR-ATT-04)**, not open to creative revision:

| Token | Hex | Meaning | Threshold |
|---|---|---|---|
| `status-safe` | `#2F9E64` | 🟢 Safe | Attendance ≥ 75% |
| `status-warning` | `#E8A33D` | 🟡 Warning | Attendance 65–74% |
| `status-critical` | `#D64545` | 🔴 Critical | Attendance < 65% |
| `status-info` | `#3E6FD9` | Informational badges (e.g. "Predicted", "Pinned") | — |

Neutrals (Tailwind slate scale, used as-is): `slate-50` → `slate-900` for text, borders, and dividers. Never introduce a fifth "brand grey" — reuse Tailwind's scale.

### 3.2 Typography System

Three type roles, each doing one job:

| Role | Typeface | Where it's used |
|---|---|---|
| **Display** | `Fraunces` (serif, variable weight) | Page titles, dashboard hero numbers (CGPA/SGPA callouts), empty-state headlines |
| **UI / Body** | `Inter` | All interface text — nav, labels, buttons, forms, paragraph copy |
| **Data / Mono** | `IBM Plex Mono` | Every numeric value that represents a *record*: grades, credit hours, percentages, dates, subject codes |

Rationale: giving numeric data its own monospaced face makes grade tables and attendance figures scan like a real transcript, and visually separates "data I entered" from "UI chrome around it."

Type scale (Tailwind scale, applied consistently):

```
text-xs    12px  → captions, badge labels
text-sm    14px  → body copy, table cells, form labels
text-base  16px  → default body
text-lg    18px  → card titles
text-2xl   24px  → section headers
text-4xl   36px  → hero numbers (CGPA, SGPA) — Fraunces, tabular-nums
text-6xl   60px  → predictor "big number" on Predictor page only
```

### 3.3 Spacing & Layout Scale

Per `rules.md` §4.3, only these spacing steps are used — never `p-3`, `p-5`, `p-7`:

```
p-2 (8px)  p-4 (16px)  p-6 (24px)  p-8 (32px)
```

| Layout region | Spacing |
|---|---|
| Card padding | `p-6` |
| Card gap in grid | `gap-4` |
| Section vertical rhythm | `p-8` between major sections |
| Form field gap | `gap-4` |
| Dense admin table cell padding | `p-2` |

### 3.4 Radius & Elevation

| Token | Value | Usage |
|---|---|---|
| `rounded-md` | 6px | Inputs, buttons, badges |
| `rounded-lg` | 10px | Cards, modals |
| `rounded-full` | — | Avatars, status dots, pill badges |
| `shadow-sm` | subtle | Default card elevation |
| `shadow-md` | medium | Modals, dropdowns, hover-raised cards |
| Border style | `border border-slate-200` (light) / `border-slate-800` (dark) | Preferred over heavy shadows for card separation — flatter, calmer surface |

### 3.5 Iconography

`lucide-react`, 20px default, 1.5px stroke. Icons always pair with a text label in navigation (never icon-only nav items, for accessibility and clarity). Status icons (safe/warning/critical) use filled variants; all other icons use outline/stroke variants.

---

## 4. Signature Element: The Attendance Ledger Strip

Every subject's attendance is more than a percentage — it's a sequence of classes. Instead of a single progress bar, the platform's one signature visual is a **ledger strip**: a horizontal row of small marks, one per class session, styled like a physical attendance register:

```
Data Structures (Sem 3)                              82% 🟢
■ ■ ■ ■ ▢ ■ ■ ■ ■ ■ ▢ ■ ■ ■ ■ ■ ┄ ┄ ┄ ┄ ┄
                                └─ upcoming (not yet held)
■ = attended   ▢ = absent   ┄ = scheduled, not yet held
```

- Filled square (`status-safe` tint) = attended
- Hollow square (`status-critical` outline) = absent
- Dashed square (`slate-300`) = not yet held this term

This strip appears on the **Attendance page** (one per subject) and in condensed form (last 10 sessions) on the **Student Dashboard** attendance card. It's the one place the design takes a genuine risk — everywhere else stays quiet and disciplined so this element reads as intentional, not decorative.

---

## 5. Layout System (App Shell)

```
┌────────────────────────────────────────────────────────────┐
│  Topbar: Logo · Breadcrumb            Search   🔔  Avatar ▾ │
├───────────┬────────────────────────────────────────────────┤
│           │                                                │
│  Sidebar  │                Main Content Area               │
│  (icons + │                (routed page content,           │
│   labels) │                 max-width 1200px, centered)     │
│           │                                                │
│  - Dash   │                                                │
│  - Attend │                                                │
│  - Grades │                                                │
│  - Predict│                                                │
│  - Tasks  │                                                │
│  - Resourc│                                                │
│           │                                                │
└───────────┴────────────────────────────────────────────────┘
```

- **Sidebar** renders items from the `/student/*` or `/admin/*` route tree in `architecture.md` §3.2 — role-driven, not hardcoded per page.
- Sidebar collapses to icon-only rail at `md` breakpoint, and to a bottom tab bar on `sm` (mobile).
- Topbar breadcrumb reflects the current route; the admin shell adds a persistent "Admin Mode" tag next to the logo so the two roles are never visually ambiguous, per `rules.md` §4.6 (route guards).

### 5.1 Responsive Breakpoints

| Breakpoint | Width | Layout change |
|---|---|---|
| `sm` | < 640px | Sidebar → bottom tab bar (5 icons max); single-column cards; Kanban → List view by default |
| `md` | 640–1024px | Sidebar collapses to icon rail; 2-column card grid |
| `lg` | ≥ 1024px | Full sidebar with labels; 3-column dashboard grid |

---

## 6. Component Specifications

### 6.1 Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | Solid `ink` bg, white text | Main call-to-action (Save, Submit, Log Attendance) |
| Secondary | Outline `ink`, `ink` text | Secondary actions (Cancel, Edit) |
| Accent | Solid `chalk-teal` | Predictor "Run Simulation", chart-related actions |
| Destructive | Outline `status-critical`, fills solid on hover | Delete subject/course, remove student |
| Ghost | No border, `slate-600` text | Table row actions, icon buttons |

All buttons: `rounded-md`, `p-2` vertical / `p-4` horizontal, visible focus ring (`ring-2 ring-offset-2 ring-ink`), disabled state at 50% opacity + `cursor-not-allowed`. Submit buttons disable and show a spinner while a form is submitting, per `rules.md` §4.5.

### 6.2 Status Badges

Pill-shaped (`rounded-full`, `px-2 py-1`, `text-xs`), always icon + text, never color alone (accessibility — color is never the only signal):

```
🟢 Safe · 82%      🟡 Warning · 70%      🔴 Critical · 58%
📌 Pinned          🔮 Predicted          ⏰ Overdue
```

### 6.3 Cards

Single-purpose containers: `rounded-lg`, `border border-slate-200`, `shadow-sm`, `p-6`. Dashboard cards follow a fixed anatomy: **label (small caps, `slate-500`) → hero number (Fraunces, `text-4xl`) → supporting line → optional action link**.

### 6.4 Forms

All forms per `rules.md` §4.5 — React Hook Form + Zod. Design spec:

- Label above field (`text-sm`, `slate-700`), never placeholder-as-label.
- Error text appears directly under the field in `status-critical`, with an inline icon — never a top-of-form error summary alone.
- Required fields marked with a subtle asterisk, not color.
- Inputs: `rounded-md`, `border-slate-300`, focus ring `ink`.

### 6.5 Modals

Used for: task creation, note/resource editing, confirmation of destructive admin actions (delete course/subject, remove student). `shadow-md`, `rounded-lg`, max-width 480px, backdrop `bg-slate-900/40`. Destructive confirmations always restate the consequence in plain language (e.g. "This archives the subject — student records are kept but the subject is hidden from new enrollments") rather than a generic "Are you sure?"

### 6.6 Toasts

`react-hot-toast`, top-right, 4s auto-dismiss for success, persistent-until-dismissed for errors. Copy pattern: past-tense confirmation of the action just taken — "Grade saved," "Task marked done," "Subject archived" — matching the verb the button used, per the writing guidance in §11.

### 6.7 Tables (Admin surfaces)

Dense: `p-2` cell padding, `text-sm`, zebra-striped rows (`even:bg-slate-50`), sticky header on scroll, sortable column headers with a subtle chevron. Pagination controls (per `rules.md` §6.3 — lists >50 records are paginated) sit bottom-right, 25 rows/page default.

### 6.8 Charts (Recharts)

- **SGPA/CGPA history**: line chart, `ink` solid line for completed semesters, `chalk-teal` **dashed** line for predicted semesters — the dash pattern is the only signal needed to distinguish real vs. projected data (reinforced by an "actual / predicted" legend).
- **Attendance trend**: stacked area, `status-safe`/`status-warning`/`status-critical` bands.
- All charts: tooltips show exact values in the mono data face; axis labels in `Inter` `text-xs`.

### 6.9 Calendar (React Big Calendar)

Restyled to match tokens: today column tinted `paper`/`chalk-teal` at 10% opacity, task chips colored by `priority` (High = `status-critical`, Medium = `status-warning`, Low = `slate-400`), overdue tasks get a small red corner badge, not a full red chip (keeps the calendar scannable).

### 6.10 Kanban Board (Task Scheduler)

Three columns — To Do / In Progress / Done — fixed order per `Task.status` enum. Cards show title, priority dot, subject tag (if linked), and due date in mono face. Drag handle is a visible six-dot grip, not the whole card, so accidental drags are less likely on mobile.

---

## 7. Screen-Level Specs

Expands the Screen Inventory in PRD §14 with layout intent for each.

### 7.1 Login / Register
Centered single card on `paper` background, max-width 400px. No role selector on Register (per FR-AUTH-03) — this is a deliberate omission, not an oversight, and a small caption under the form states *"Registering creates a student account. Admin access is provisioned separately."*

### 7.2 Course Selection (Onboarding)
Full-width single-step form: course dropdown → semester dropdown → confirm. A visible warning banner (not a modal) states the choice locks after confirmation (per FR-ONBOARD-02), so the student reads it before committing rather than dismissing a popup.

### 7.3 Student Dashboard
3-column bento grid (collapses to 1 column on mobile):
```
┌───────────────┬───────────────┬───────────────┐
│  CGPA (hero)  │  Attendance   │  Tasks Today   │
│  Fraunces 4xl │  ledger strips│  next 3 due    │
│  + trend line │  (top 3 risk) │  + "view all"  │
└───────────────┴───────────────┴───────────────┘
┌───────────────────────────────────────────────┐
│  SGPA history chart (full width)               │
└───────────────────────────────────────────────┘
```

### 7.4 Attendance Page
Subject-wise list, each row = subject name + ledger strip + percentage badge + "Log class" button. Filtering by semester via tabs at top, matching Grades page pattern for consistency.

### 7.5 Grades Page
Semester tabs → table of subjects with letter-grade `<select>` per row → SGPA auto-recalculates and animates (number count-up, 300ms) in a sticky summary bar at the bottom of the table.

### 7.6 CGPA Predictor
Split layout: left = input panel (expected grade per remaining subject, target CGPA field), right = trajectory chart + three result cards (Best-case / Worst-case / Current-trend), each using the mono hero number treatment at `text-6xl` for the single most important figure: **minimum SGPA needed**.

### 7.7 Task Scheduler
Toggle (segmented control) between List / Calendar / Kanban — state persists per user in the Zustand `taskStore`, not reset on navigation.

### 7.8 Resources & Notes
Two-section subject page: **Pinned (Admin)** section always on top with a 📌 badge and `chalk-teal` left border, **My Notes & Links** below. Search/filter bar (by tag/keyword) sits above the personal section only — pinned resources aren't searched, they're always visible (per `rules.md` §9).

### 7.9 Admin Dashboard
Analytics-dense: KPI row (students enrolled, avg CGPA, at-risk count, task completion %) as compact stat cards, followed by two charts (CGPA distribution, attendance trend) and an "At-Risk Students" table below, sorted by severity.

### 7.10 Course Manager
Two-pane layout: left = course list (click to expand semesters as a tree), right = subject table for the selected semester with inline add/edit/archive actions. Archiving (not deleting) a subject shows a muted "Archived" tag rather than removing it from the tree, per FR-COURSE-05.

### 7.11 Student Directory / Student Profile View
Directory: searchable/filterable dense table (per §6.7). Clicking a row opens Student Profile as a full page (not a modal, given the amount of data) — tabs for Attendance / Grades / Tasks within the profile, reusing the same components as the student's own pages, so admin and student data never look like two different products.

---

## 8. Interaction & Motion Guidelines

Motion is used only where it clarifies a state change, never as ambient decoration:

- Number changes (SGPA recalculation, CGPA update) — 300ms count-up, no bounce.
- Toast enter/exit — 150ms slide + fade.
- Modal open — 150ms fade + scale from 98%→100%.
- Drag-and-drop (Kanban) — card follows cursor at 1:1, drop zones highlight with a dashed `chalk-teal` outline.
- `prefers-reduced-motion` is respected everywhere — all of the above degrade to instant state changes.

---

## 9. Accessibility (WCAG 2.1 AA)

- All status information (attendance health, priority, task status) is conveyed by **icon + text label**, never color alone.
- Minimum contrast ratio 4.5:1 for body text, verified against both `paper` and `deep-ink` backgrounds for every token pairing.
- Every interactive element has a visible keyboard focus ring (`ring-2 ring-ink`, or `ring-chalk-teal` on dark surfaces).
- Sidebar and Kanban drag interactions have keyboard-operable equivalents (arrow-key reorder / explicit "Move to…" menu).
- Form errors are announced via `aria-live="polite"` regions, not just visual placement.
- All charts include a visually-hidden data table fallback for screen readers.

---

## 10. Dark Mode Rules

Dark mode is a first-class variant, not an inverted afterthought (per `rules.md` §4.3):

| Light | Dark |
|---|---|
| `paper` (#F3F4F7) background | `deep-ink` (#14161F) background |
| `ink` primary buttons | `chalk-teal` becomes the primary accent (ink is too dark to read as an accent on dark bg) |
| `slate-200` borders | `slate-800` borders |
| Status colors | Same hex values, but backgrounds behind badges shift to a 15%-opacity tint of the status color instead of white, to avoid harsh contrast |

Every new component must be checked in both modes before merge, per `rules.md` §4.3.

---

## 11. Content & Voice Guidelines

- Write from the student's or admin's point of view: "Log attendance," not "Submit attendance record."
- Buttons and their resulting toasts share the same verb: "Save note" → "Note saved."
- Empty states are invitations, not apologies: the empty Task list reads *"Nothing scheduled yet — add your first task"* with the Add button right there, not a lone illustration.
- Errors state what happened and what to do, without blame: *"That email is already registered — try logging in instead"*, never "Invalid input."
- Numbers speak for themselves — avoid restating a percentage in a sentence next to the number it labels.

---

## 12. Tailwind Token Reference

For direct use in `tailwind.config.js` (frontend, per `architecture.md` §2.1):

```js
// tailwind.config.js (excerpt)
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#2B3A67',
        'chalk-teal': '#2E8B8B',
        paper: '#F3F4F7',
        'deep-ink': '#14161F',
        'status-safe': '#2F9E64',
        'status-warning': '#E8A33D',
        'status-critical': '#D64545',
        'status-info': '#3E6FD9',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        md: '6px',
        lg: '10px',
      },
    },
  },
};
```

---

## 13. Design QA Checklist

Before merging any new screen or component:

```
[ ] Uses only tokens defined in Section 3 — no ad-hoc hex values or spacing
[ ] Status conveyed by icon + text, not color alone
[ ] Checked in both light and dark mode
[ ] Responsive at sm / md / lg breakpoints
[ ] Keyboard focus visible on every interactive element
[ ] Loading, empty, and error states all designed — not just the happy path
[ ] Numeric data uses the mono face; UI text uses Inter
[ ] Admin-only surfaces are visually distinct in density/tone from student surfaces
[ ] Copy follows Section 11 (active voice, matching verbs, no blame in errors)
[ ] Skeleton screens exist for all async data-fetching states (see Section 14)
[ ] Notification panel behaviour verified if page has bell icon (see Section 15)
[ ] Bottom tab bar tested on iPhone SE viewport (375px) (see Section 16)
```

---

## 14. Skeleton / Loading States

Every screen that fetches data must have a **skeleton screen** — a placeholder layout rendered instantly while the API call is in-flight. Skeletons use the same card/grid structure as the real page so there is no layout shift when data arrives.

### 14.1 Rules

- Skeleton cells use `bg-slate-200 dark:bg-slate-700` animated with a shimmer sweep (`animate-pulse`).
- Skeleton dimensions must match the real content dimensions — never use a generic full-width bar for a 3-column grid.
- Skeleton screens time out to an **error state** if data has not loaded within **8 seconds** — never infinite shimmer.
- Never show a spinner alone without the skeleton layout behind it. Spinner inside a skeleton card's hero area is acceptable.

### 14.2 Per-Screen Skeleton Specs

| Screen | Skeleton Anatomy |
|--------|-----------------|
| **Student Dashboard** | 3 shimmer cards (hero number area `h-16`, supporting line `h-4`) + 1 full-width chart placeholder `h-48` |
| **Attendance Page** | Semester tab bar (real, tabs load instantly) + 6 shimmer subject rows, each `h-12` with a ledger strip placeholder |
| **Grades Page** | Semester tabs (real) + table with 8 shimmer rows, grade column shows a rounded select-shaped shimmer |
| **Predictor Page** | Left panel: 5 shimmer rows of subject/grade inputs. Right panel: chart area `h-64` shimmer + 3 result card shimmers |
| **Tasks — List** | 5 shimmer task cards, each `h-16` |
| **Tasks — Calendar** | Full calendar grid renders (React Big Calendar renders immediately); task chips within cells shimmer |
| **Tasks — Kanban** | 3 column headers (real) + 3 shimmer cards per column |
| **Resources & Notes** | Pinned section: 2 shimmer link rows. Notes section: 3 shimmer note cards `h-24` |
| **Admin Dashboard** | 4 shimmer KPI cards + 2 chart placeholders + shimmer table (5 rows) |
| **Student Directory** | Table header (real) + 10 shimmer rows |
| **Student Profile** | Header card shimmer + tab bar (real) + content shimmer matching the active tab |

### 14.3 Error State (Post-Timeout)

If data fails to load, replace the skeleton with an inline error card — same dimensions as the skeleton, not a full-page takeover:

```
┌─────────────────────────────────────┐
│  ⚠  Couldn't load attendance data   │
│  Check your connection and retry.   │
│                    [ Try again ]    │
└─────────────────────────────────────┘
```

- Error card: `border border-status-warning`, `bg-status-warning/10`, `rounded-lg`, `p-6`.
- "Try again" is a Ghost button that re-triggers the API call.
- Error copy follows §11 — states what happened, offers a next action, no blame.

---

## 15. Notification Panel

The 🔔 bell icon in the topbar opens a **notification panel** — a dropdown anchored to the bell, not a full page.

### 15.1 Trigger & Anatomy

```
┌────────────────────────────────────────┐
│  Notifications                 Mark all read │
├────────────────────────────────────────┤
│  🔴  Applied Physics attendance is     │
│      now 64% — below safe threshold    │
│      2 hours ago                       │
├────────────────────────────────────────┤
│  ⏰  Assignment: OS Lab Report         │
│      is due tomorrow at 11:59 PM       │
│      1 day ago                         │
├────────────────────────────────────────┤
│  📌  Admin pinned a new resource to    │
│      Engineering Mathematics-I         │
│      3 days ago                        │
├────────────────────────────────────────┤
│            View all notifications →    │
└────────────────────────────────────────┘
```

- Panel width: `w-96` (384px), max-height `max-h-[480px]`, scrollable if more than 5 items.
- Anchored below the bell icon, `shadow-md`, `rounded-lg`, `border border-slate-200`.
- Unread notifications have a `bg-ink/5` tint + a `status-info` left border `border-l-4`.
- Read notifications have no tint, `slate-400` timestamp text.
- The bell icon shows a red dot badge (not a number count) when there are unread notifications — the dot disappears when the panel is opened.
- "Mark all read" clears the dot and removes all tints in one action.

### 15.2 Notification Types

| Type | Trigger (per PRD) | Icon | Copy pattern |
|------|------------------|------|--------------|
| Attendance alert | Attendance drops below 75% | 🔴 | *"[Subject] attendance is now [X]% — below safe threshold"* |
| Task reminder | 24 hours before due date | ⏰ | *"[Task title] is due tomorrow at [time]"* |
| Admin pin | Admin pins a resource to a subject | 📌 | *"Admin pinned a new resource to [Subject name]"* |
| Admin broadcast | Admin posts a task/notice to all | 📢 | *"[Admin broadcast title] — tap to view"* |

### 15.3 Empty State

When there are no notifications:

```
┌──────────────────────────────┐
│                              │
│        🔔                    │
│   You're all caught up       │
│                              │
└──────────────────────────────┘
```

`text-slate-400`, `text-sm`, centered, no action needed.

### 15.4 Storage

Notifications are **in-app only** (per PRD §10 — email notifications are out of scope for v1.0). They are generated server-side and stored in the `Notification` model (to be added to Prisma schema in a future update — for v1.0, generate notifications client-side based on data thresholds computed on the frontend after API fetch).

---

## 16. Mobile Bottom Tab Bar

On `sm` breakpoint (< 640px), the sidebar collapses into a **fixed bottom tab bar** — 5 items maximum, always visible.

### 16.1 Layout

```
┌──────────────────────────────────────────┐
│                                          │
│           (page content)                 │
│                                          │
├──────────────────────────────────────────┤
│  🏠      📅      📊      ✅      📚     │
│ Home  Attend  Grades  Tasks  Resources  │
└──────────────────────────────────────────┘
```

- Height: `h-16` (64px), `bg-white dark:bg-deep-ink`, `border-t border-slate-200 dark:border-slate-800`.
- Each tab: icon (24px) centered above a `text-xs` label.
- **Active tab**: icon filled variant + `ink` color + `chalk-teal` underline dot `w-1 h-1 rounded-full` below icon.
- **Inactive tab**: icon outline + `slate-400`.
- The CGPA Predictor is **not** in the bottom bar (it's accessible via the Grades page as a secondary action) — only the 5 most-used pages appear.
- Admin mobile bar: Home / Students / Courses / Tasks / (no Resources — admin has no personal resources on mobile primary nav).

### 16.2 Safe Area

Bottom tab bar must respect iOS safe area inset — use `pb-safe` (or `padding-bottom: env(safe-area-inset-bottom)`) so the tab bar never overlaps the iPhone home indicator.

### 16.3 Page Content Offset

All page content must have `pb-20` (80px) padding at the bottom on `sm` breakpoint to prevent the last card/row from being hidden behind the tab bar.

---

## 17. Degree Progress Indicator

A unique component that answers the question *"How far through my degree am I?"* — displayed on the Student Dashboard below the CGPA hero card, and in the Student Profile view (admin).

### 17.1 Visual Design

```
B.Tech Computer Science  ·  Semester 3 of 8

Sem 1   Sem 2   Sem 3   Sem 4   Sem 5   Sem 6   Sem 7   Sem 8
  ●───────●───────●  ─ ─ ─ ○ ─ ─ ─ ○ ─ ─ ─ ○ ─ ─ ─ ○ ─ ─ ─ ○
 8.45    8.62   now

■ = completed (shows SGPA below dot)
● = current semester (pulsing dot, ink color)
○ = future (dashed line, slate-300)
```

- The completed dots are filled `ink` circles connected by a solid line.
- Each completed dot has the **SGPA for that semester** rendered below in `IBM Plex Mono text-xs`.
- The current semester dot pulses with a `ping` animation (Tailwind `animate-ping` at 50% opacity) — subtle, the one use of ambient animation in the product, justified because it literally marks *where the student is right now*.
- Future dots are hollow `slate-300` circles connected by a dashed line.

### 17.2 Placement

- **Student Dashboard**: Full-width strip below the 3-column bento grid, above the SGPA chart. Shows the student's own progress.
- **Admin Student Profile**: Below the student info header, above the Attendance/Grades/Tasks tabs. Read-only.

### 17.3 Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Semester 1, no grades yet | 1 pulsing dot, no SGPA shown, future dots from Sem 2 onward |
| Final semester (e.g. Sem 8 of 8) | All dots filled, current dot pulses, no dashes after it |
| Student's semester changed by admin | Component re-renders with new "current" position |

---

*End of Document — Version 1.1*
*Companion to PRD_Student_Academic_Platform.md v1.1, architecture.md v1.1, rules.md v1.1, and phases.md v1.0.*
*Added in v1.1: Section 14 (Skeleton States), Section 15 (Notification Panel), Section 16 (Mobile Bottom Tab Bar), Section 17 (Degree Progress Indicator). Updated QA checklist.*
