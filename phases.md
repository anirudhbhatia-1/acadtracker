# 🗓️ Development Phases
## Student Academic Management Platform

---

**Version:** 1.0
**Date:** July 14, 2026
**Total Duration:** 13 Weeks
**Related Documents:** PRD v1.1 | architecture.md v1.1 | rules.md v1.1

---

## 📊 Phase Overview

```
Week 0    │ Pre-Dev Setup
──────────┼──────────────────────────────────────────────────────────
Week 1–2  │ Phase 1 — Foundation (Auth, DB, Project Setup)
──────────┼──────────────────────────────────────────────────────────
Week 3–5  │ Phase 2 — Core Academic (Attendance, Grades, SGPA/CGPA)
──────────┼──────────────────────────────────────────────────────────
Week 6–7  │ Phase 3 — Task & Assignment Scheduler
──────────┼──────────────────────────────────────────────────────────
Week 8–9  │ Phase 4 — CGPA Predictor + Resources & Notes
──────────┼──────────────────────────────────────────────────────────
Week 10–11│ Phase 5 — Admin Tools (Course Manager + Student Monitor)
──────────┼──────────────────────────────────────────────────────────
Week 12   │ Phase 6 — Polish, Testing & Bug Fixes
──────────┼──────────────────────────────────────────────────────────
Week 13   │ Launch — Production Deployment
```

---

## ⚙️ Phase 0 — Pre-Development Setup
**Duration:** Before Week 1 begins (1–2 days)
**Goal:** Get the entire project skeleton ready so development can start immediately.

### Tasks

#### Repository & Project Init
- [x] Create GitHub repository with `main` and `dev` branches
- [ ] Set up branch protection rules on `main` (require PR + review)
- [x] Create `/client` folder — init React project with Vite
- [x] Create `/server` folder — init Node.js project with Express
- [x] Create root `.gitignore` covering both `/client` and `/server`
- [x] Create `.env.example` in `/server` with all required variable names

#### Client Setup
- [x] Install and configure Tailwind CSS
- [x] Install React Router v6
- [x] Install Zustand, Axios, React Hook Form, Zod
- [x] Install Recharts, React Big Calendar, React Hot Toast, shadcn/ui
- [x] Create base folder structure: `components/`, `pages/`, `services/`, `hooks/`, `utils/`, `store/`, `routes/`
- [x] Create `api.js` — Axios instance with base URL from `VITE_API_BASE_URL`

#### Server Setup
- [x] Install Express, Prisma, bcrypt, jsonwebtoken, zod, cors, dotenv
- [x] Install express-rate-limit, cookie-parser, express-async-errors
- [x] Set up Prisma with Railway PostgreSQL `DATABASE_URL`
- [x] Create base folder structure: `modules/`, `middlewares/`, `config/`, `utils/`
- [x] Create `app.js` (Express app) and `server.js` (HTTP entry)
- [x] Connect Redis (Upstash) client in `config/redis.js`

#### Cloud Setup
- [x] Create Railway project — add PostgreSQL plugin
- [x] Create Upstash Redis instance — copy connection URL
- [ ] Connect GitHub repo to Railway (auto-deploy on push to `main`)
- [ ] Connect GitHub repo to Vercel (auto-deploy on push to `main`)
- [ ] Set all environment variables in Railway and Vercel dashboards

### ✅ Phase 0 Done When
- Both `/client` and `/server` run without errors
- Prisma connects to Railway PostgreSQL successfully
- Redis connection is verified
- GitHub repo is live with `main` and `dev` branches protected

---

## 🏗️ Phase 1 — Foundation
**Duration:** Week 1–2 (14 days)
**Goal:** Authentication, role system, course selection flow, and complete database schema.

### 1.1 Database

- [ ] Write full Prisma schema (all models: User, Course, Subject, Attendance, Grade, Task, Note, Resource)
- [ ] Add all enums: Role, SubjectType, LetterGrade, Priority, Category, TaskStatus, NoteTag, ResourceType
- [ ] Run first migration: `prisma migrate dev --name init_schema`
- [ ] Write `prisma/seed.js` — create admin account using env credentials
- [ ] Run seed script and verify admin exists in DB

### 1.2 Backend — Auth Module

- [ ] `POST /api/v1/auth/register` — student registration (name, email, password)
  - Hash password with bcrypt (10 rounds)
  - Reject if email already exists
  - Return 201 + user object (no password hash)
- [ ] `POST /api/v1/auth/login` — login for student and admin
  - Verify email + bcrypt password
  - Sign JWT with userId, email, role
  - Set JWT in HTTP-only cookie
  - Return user object
- [ ] `POST /api/v1/auth/logout` — clear the cookie
- [ ] `GET /api/v1/auth/me` — return logged-in user profile
- [ ] `PATCH /api/v1/auth/me` — update name or password
- [ ] `auth.middleware.js` — verify JWT from cookie, attach `req.user`
- [ ] `admin.middleware.js` — check `req.user.role === 'ADMIN'`
- [ ] `validate.middleware.js` — Zod schema validation factory
- [ ] `errorHandler.js` — centralized error response middleware
- [ ] Add rate limiting (10 req/min) to all `/auth` routes
- [ ] Configure CORS — allow only frontend URL from env

### 1.3 Backend — Onboarding Module

- [ ] `POST /api/v1/onboarding/select-course` — set courseId + currentSemester on student
  - Only allowed if `isOnboarded === false`
  - Mark `isOnboarded = true` on success
- [ ] Protect route with `auth.middleware.js`

### 1.4 Frontend — Auth Pages

- [ ] `Login.jsx` — email + password form with React Hook Form + Zod
  - Show error if credentials wrong
  - Redirect to `/student/dashboard` or `/admin/dashboard` based on role
- [ ] `Register.jsx` — name, email, password, confirm password
  - Show inline validation errors
  - Redirect to `/onboarding` after success
- [ ] `authService.js` — `login()`, `register()`, `logout()`, `getMe()`
- [ ] `authStore.js` (Zustand) — store user object globally
- [ ] `ProtectedRoute.jsx` — redirect to `/login` if no valid JWT
- [ ] `AdminRoute.jsx` — redirect to `/student/dashboard` if not admin

### 1.5 Frontend — Course Selection (Onboarding)

- [ ] `CourseSelection.jsx` — show list of available courses as cards
  - Student selects course + current semester
  - Confirm selection — call `POST /onboarding/select-course`
  - Redirect to `/student/dashboard` after confirm
- [ ] Block access to this page if `isOnboarded === true`

### ✅ Phase 1 Done When
- [ ] Student can register, login, and land on dashboard
- [ ] Admin can login with pre-seeded credentials
- [ ] Student is prompted to select course on first login
- [ ] JWT is stored in HTTP-only cookie and verified on every request
- [ ] Admin-only routes return 403 when accessed by a student
- [ ] All DB models exist and are migrated on Railway PostgreSQL

---

## 📚 Phase 2 — Core Academic Modules
**Duration:** Week 3–5 (21 days)
**Goal:** Attendance tracking, grade entry, SGPA and CGPA auto-calculation.

### 2.1 Backend — Course & Subject Module

- [ ] `GET /api/v1/courses` — list all courses (public to all auth users)
- [ ] `POST /api/v1/courses` — admin creates course
- [ ] `PATCH /api/v1/courses/:id` — admin edits course
- [ ] `DELETE /api/v1/courses/:id` — admin deletes course
- [ ] `GET /api/v1/courses/:id/subjects` — get subjects (filter by `?semester=`)
- [ ] `POST /api/v1/courses/:id/subjects` — admin creates subject
- [ ] `PATCH /api/v1/subjects/:id` — admin edits subject
- [ ] `DELETE /api/v1/subjects/:id` — admin archives subject (`isArchived = true`)

### 2.2 Backend — Grade Engine

- [ ] `server/src/utils/gradeMap.js` — define `GRADE_POINTS` constant object
- [ ] `server/src/modules/grades/gradeEngine.js`
  - `calculateSGPA(subjects)` — exclude 0-credit subjects
  - `calculateCGPA(semesters)` — weighted average across semesters
- [ ] Unit test both functions against the confirmed grade card example (SGPA = 8.45)

### 2.3 Backend — Grades Module

- [ ] `GET /api/v1/grades/me` — get own grades (all semesters)
- [ ] `POST /api/v1/grades` — enter/update a grade (student)
  - Derive `gradePoints` from `letterGrade` using `GRADE_POINTS` map
  - Upsert on `[studentId, subjectId, semesterNo]`
- [ ] `GET /api/v1/grades/me/sgpa` — return SGPA per semester (calculated)
- [ ] `GET /api/v1/grades/me/cgpa` — return current CGPA (calculated)
- [ ] `GET /api/v1/grades/student/:id` — admin views student's grades
- [ ] `PATCH /api/v1/grades/:id` — admin edits student grade

### 2.4 Backend — Attendance Module

- [ ] `GET /api/v1/attendance/me` — get own attendance (all subjects)
  - Include `classesNeededFor75` and `classesCanMiss` in response
- [ ] `POST /api/v1/attendance/log` — student logs attendance for a subject (increment total + attended)
- [ ] `PATCH /api/v1/attendance/:id` — student corrects attendance record
- [ ] `GET /api/v1/attendance/student/:id` — admin views student's attendance
- [ ] `PATCH /api/v1/attendance/student/:id/:subjectId` — admin edits attendance
- [ ] `server/src/utils/attendanceUtils.js` — `getAttendanceSummary()` with all formulas

### 2.5 Frontend — Student Dashboard

- [ ] `Dashboard.jsx` — summary cards:
  - Current CGPA
  - Overall attendance health (% of subjects above 75%)
  - Pending tasks count
  - Next upcoming deadline
- [ ] `SGPALineChart.jsx` — line chart showing SGPA per semester (Recharts)
- [ ] Fetch data from `gradeService.js` and `attendanceService.js`

### 2.6 Frontend — Attendance Page

- [ ] `Attendance.jsx` — table with one row per subject:
  - Subject name, total classes, attended, percentage, status badge
  - "Classes to attend to reach 75%" display
  - "Classes you can still miss" display
- [ ] `AttendanceBadge.jsx` — color-coded badge: 🟢 Safe / 🟡 Warning / 🔴 Critical
- [ ] Log attendance button per subject — opens a modal to confirm
- [ ] In-app toast alert if any subject drops below 75%

### 2.7 Frontend — Grades Page

- [ ] `Grades.jsx` — semester tabs (Semester 1, 2, 3…)
  - Each tab shows a table of subjects with letter grade dropdown
  - SGPA auto-displays at bottom of each tab as student enters grades
  - CGPA displays in the page header — updates live
- [ ] `GradeRow.jsx` — single row: subject name, credit hours, grade dropdown
- [ ] `SGPADisplay.jsx` — shows calculated SGPA for current semester

### ✅ Phase 2 Done When
- [ ] Student can log and view attendance per subject
- [ ] Attendance % and helper values calculate correctly
- [ ] In-app alert fires when attendance < 75%
- [ ] Student can enter letter grades and SGPA auto-calculates
- [ ] SGPA matches the confirmed grade card example (8.45)
- [ ] CGPA updates correctly across multiple semesters
- [ ] Admin can view and edit any student's grades and attendance

---

## 📅 Phase 3 — Task & Assignment Scheduler
**Duration:** Week 6–7 (14 days)
**Goal:** Full task management system with List, Calendar, and Kanban views.

### 3.1 Backend — Tasks Module

- [ ] `GET /api/v1/tasks/me` — get own tasks (filter by status, category, priority)
- [ ] `POST /api/v1/tasks` — create task (title, description, dueDate, priority, category, subjectId?)
- [ ] `PATCH /api/v1/tasks/:id` — update task (status, priority, title, due date)
- [ ] `DELETE /api/v1/tasks/:id` — delete task (only own tasks)
- [ ] `POST /api/v1/tasks/broadcast` — admin creates notice visible to all students
- [ ] Auto-flag overdue tasks (where `dueDate < now` and `status !== DONE`)

### 3.2 Frontend — Task Scheduler Page

- [ ] `Tasks.jsx` — main page with 3 view toggle buttons: List / Calendar / Kanban
- [ ] **List View** — `TaskList.jsx`
  - Sorted by due date (soonest first)
  - Filter bar: by status, priority, category
  - Overdue tasks highlighted with red badge
  - Click task to open edit modal
- [ ] **Calendar View** — `CalendarView.jsx`
  - Monthly/weekly view using React Big Calendar
  - Tasks appear on their due date
  - Click a task to open edit modal
  - Click empty date to open create modal
- [ ] **Kanban View** — `KanbanBoard.jsx`
  - 3 columns: To Do / In Progress / Done
  - Drag and drop cards between columns
  - Each card shows: title, due date, priority color indicator, category tag
- [ ] **Add Task Modal** — form with all fields (title, desc, due date/time, priority, category, subject)
- [ ] **Edit Task Modal** — pre-filled form, status dropdown, delete button
- [ ] In-app reminder toast: fires 24 hours before task due date (checked on page load)
- [ ] `taskStore.js` (Zustand) — global task state
- [ ] `taskService.js` — all API calls

### ✅ Phase 3 Done When
- [ ] Students can create, edit, delete tasks
- [ ] All 3 views (List, Calendar, Kanban) display tasks correctly
- [ ] Drag-and-drop works in Kanban view
- [ ] Overdue tasks are visually highlighted
- [ ] 24-hour reminder toast appears for upcoming tasks
- [ ] Admin broadcast notice appears for all students

---

## 🔮 Phase 4 — CGPA Predictor + Resources & Notes
**Duration:** Week 8–9 (14 days)
**Goal:** CGPA prediction engine with trajectory chart, and subject-level notes and resource links.

### 4.1 Backend — CGPA Predictor

- [ ] `POST /api/v1/predictor/simulate` — run what-if simulation
  - Accept: targetCGPA + futureSemesters with expectedGrades per subject
  - Calculate: predictedCGPA, bestCaseCGPA, worstCaseCGPA, minSGPANeeded
  - Return: trajectory array `[{ semester, sgpa, type: 'actual'|'predicted' }]`
- [ ] Add `predictCGPA()` function to `gradeEngine.js`
- [ ] Add `calculateBestCase()` — all O grades in remaining semesters
- [ ] Add `calculateWorstCase()` — all D grades in remaining semesters

### 4.2 Frontend — CGPA Predictor Page

- [ ] `Predictor.jsx` — two-panel layout:
  - **Left panel:** remaining semesters list with subject grade dropdowns (expected)
  - **Right panel:** live trajectory chart + result cards
- [ ] `PredictionChart.jsx` — Recharts line chart
  - Solid line = actual completed semesters
  - Dashed line = predicted future semesters
  - Best case / Worst case shown as shaded bands
- [ ] Result cards below chart:
  - 🎯 Predicted CGPA
  - ⬆️ Best Case CGPA
  - ⬇️ Worst Case CGPA
  - 📊 Min SGPA needed per remaining semester to reach target
- [ ] Target CGPA input — user types target and chart updates live
- [ ] All calculations update in real-time as grade dropdowns change

### 4.3 Backend — Resources & Notes Module

- [ ] `GET /api/v1/notes/me?subjectId=&semester=` — get own notes for a subject
- [ ] `POST /api/v1/notes` — create note (title, content, tag, subjectId, semesterNo)
- [ ] `PATCH /api/v1/notes/:id` — edit own note
- [ ] `DELETE /api/v1/notes/:id` — delete own note
- [ ] `GET /api/v1/notes/me/search?q=&tag=` — full-text search notes
- [ ] `GET /api/v1/resources?subjectId=&semester=` — get all resources (pinned first, then personal)
- [ ] `POST /api/v1/resources` — student adds personal resource link
- [ ] `PATCH /api/v1/resources/:id` — student edits own resource
- [ ] `DELETE /api/v1/resources/:id` — student deletes own resource
- [ ] `POST /api/v1/resources/pin` — admin pins resource (isPinned = true)
- [ ] `PATCH /api/v1/resources/pin/:id` — admin edits pinned resource
- [ ] `DELETE /api/v1/resources/pin/:id` — admin removes pinned resource
- [ ] Validate: student can only modify own resources; admin can only modify pinned ones

### 4.4 Frontend — Resources & Notes Page

- [ ] `Resources.jsx` — subject selector dropdown at top (switches active subject)
- [ ] **Pinned Resources section** (top) — `PinnedResource.jsx`
  - Shows admin-pinned links with 📌 badge
  - Resource type icon: 🎥 YouTube / 📄 Article / 📁 Drive / 🔗 Other
- [ ] **My Notes section** — `NoteCard.jsx`
  - Card layout: title, tag badge, content preview, edit/delete buttons
  - Click to expand full note content
  - Tag filter: All / Lecture Notes / Summary / Formula Sheet / Revision
- [ ] **My Links section** — `LinkCard.jsx`
  - List of personal saved URLs with type icon, title, and delete button
- [ ] **Add Note Modal** — title, content (textarea), tag dropdown
- [ ] **Add Link Modal** — title, URL, resource type dropdown
- [ ] Search bar — filters notes by keyword or tag in real-time
- [ ] `resourceService.js` — all API calls for notes and resources

### ✅ Phase 4 Done When
- [ ] CGPA prediction calculates correctly for all scenarios
- [ ] Trajectory chart shows actual + predicted data points
- [ ] Best/worst/expected CGPA projections display correctly
- [ ] Students can add, edit, delete notes per subject
- [ ] Students can add, edit, delete resource links per subject
- [ ] Admin-pinned resources appear at the top with 📌 badge
- [ ] Search/filter for notes works correctly
- [ ] Personal notes are not visible to other students (privacy check)

---

## 👨‍💼 Phase 5 — Admin Tools
**Duration:** Week 10–11 (14 days)
**Goal:** Course & subject management, student monitoring, and platform analytics.

### 5.1 Backend — Admin Module

- [ ] `GET /api/v1/admin/students` — list all students (filter by course, semester, name)
- [ ] `GET /api/v1/admin/students/:id` — full student profile (attendance + grades + tasks)
- [ ] `PATCH /api/v1/admin/students/:id/semester` — promote student to next semester
- [ ] `PATCH /api/v1/admin/students/:id/course` — change student's course
- [ ] `GET /api/v1/admin/analytics` — platform analytics:
  - Total students per course
  - Average CGPA by course and semester
  - Count of students with attendance < 75% in any subject
  - Task completion rate across platform
- [ ] `GET /api/v1/admin/at-risk` — students with:
  - Any subject attendance < 75%, OR
  - CGPA below 5.0

### 5.2 Frontend — Admin Dashboard

- [ ] `AdminDashboard.jsx` — analytics overview:
  - 4 summary cards: Total Students / Avg CGPA / At-Risk Count / Active Courses
  - Bar chart: Average CGPA by course (Recharts)
  - Pie/donut chart: Attendance health distribution
  - At-risk student table (quick view, clickable rows)

### 5.3 Frontend — Course Manager

- [ ] `CourseManager.jsx` — tree view layout:
  ```
  ▼ B.Tech Computer Science (BTCS)
      ▼ Semester 1
          • Foundation of AI & ML (BCO353A) — 3 credits — Theory
          • Computer Programming (DCO013A) — 3 credits — Theory
          + Add Subject
      ▼ Semester 2
          ...
      + Add Semester
  + Add Course
  ```
- [ ] Add Course modal — name, code, department, total semesters
- [ ] Add Subject modal — name, code, credits, type (Theory/Lab/Elective/Audit)
- [ ] Edit/Delete buttons on each course and subject row
- [ ] Confirm dialog before deleting a course or subject
- [ ] Show student count enrolled in each course

### 5.4 Frontend — Student Directory

- [ ] `StudentDirectory.jsx` — searchable, filterable student table:
  - Columns: Name, Email, Course, Semester, CGPA, Attendance Status, Actions
  - Search by name or email
  - Filter by course and semester
  - Sort by CGPA (asc/desc)
  - At-risk badge on flagged students
- [ ] Click a row → opens `StudentProfile.jsx`

### 5.5 Frontend — Student Profile (Admin View)

- [ ] `StudentProfile.jsx` — full profile page:
  - Student info header (name, email, course, semester)
  - Attendance tab — subject-wise attendance table
  - Grades tab — semester-wise grade table with SGPA per sem + CGPA
  - Tasks tab — list of student's tasks and statuses
  - Edit buttons: change course, promote semester
- [ ] Admin can view pinned resources but cannot see student's personal notes/resources

### ✅ Phase 5 Done When
- [ ] Admin can create, edit, delete courses and subjects
- [ ] New subjects auto-appear for students in that course + semester
- [ ] Admin can view full student profile with all academic data
- [ ] At-risk students are correctly flagged in the directory
- [ ] Admin can promote a student to the next semester
- [ ] Analytics dashboard loads correct data
- [ ] Admin cannot see personal notes/resources of students

---

## 🎨 Phase 6 — Polish, Testing & Bug Fixes
**Duration:** Week 12 (7 days)
**Goal:** UI polish, edge case handling, performance review, and final bug fixes.

### 6.1 UI Polish

- [ ] Consistent dark mode across all pages
- [ ] Loading skeleton screens for all data-fetching states
- [ ] Empty state illustrations for: no tasks, no grades, no resources, no students
- [ ] Smooth page transitions and micro-animations on interactive elements
- [ ] Mobile responsiveness check on all pages (iOS Safari + Android Chrome)
- [ ] Consistent typography, spacing, and color across all components
- [ ] Favicon and page title set correctly per route
- [ ] Toast notifications styled consistently throughout

### 6.2 Edge Case Handling

- [ ] Student has no grades yet — SGPA/CGPA shows "Not available"
- [ ] Student has no attendance logged — attendance shows 0% with warning
- [ ] Student has no tasks — task page shows empty state
- [ ] Admin deletes a subject that students have grades/attendance for — archived, not lost
- [ ] Student tries to access another student's data via URL manipulation — 403 returned
- [ ] Admin logs in via student register flow — blocked
- [ ] Session expiry — user redirected to login gracefully with message
- [ ] CGPA predictor with 0 remaining semesters — handled gracefully
- [ ] Network failure on API calls — show error toast with retry option

### 6.3 Performance Review

- [ ] All list queries return paginated results (max 50 per page)
- [ ] Database indexes verified on: `studentId`, `subjectId`, `semesterNo`, `role`
- [ ] No N+1 query problems — verify all Prisma queries use `include` properly
- [ ] Frontend bundle size reviewed — lazy load heavy pages (Predictor, Admin Dashboard)
- [ ] Recharts data sets are memoized — no re-renders on unrelated state changes

### 6.4 Security Review

- [ ] All admin endpoints tested to return 403 for student tokens
- [ ] Student endpoints tested to only return own data
- [ ] Rate limiter verified on auth routes
- [ ] No password hash or JWT secret appears in any API response
- [ ] CORS allows only the Vercel frontend URL — no wildcard

### 6.5 Final Checks

- [ ] All environment variables set in Railway + Vercel dashboards
- [ ] `prisma migrate deploy` runs cleanly on production DB
- [ ] Admin seed script runs once without error
- [ ] `/api/v1/auth/me` returns correct user data post-deploy
- [ ] All 6 modules tested end-to-end manually:
  - Auth ✓ | Attendance ✓ | Grades ✓ | Tasks ✓ | Predictor ✓ | Resources ✓

### ✅ Phase 6 Done When
- [ ] Zero critical bugs outstanding
- [ ] All pages load in < 2 seconds
- [ ] Platform is fully responsive on mobile
- [ ] All edge cases handled gracefully
- [ ] Security review passed

---

## 🚀 Launch — Production Deployment
**Duration:** Week 13

### Pre-Launch Checklist

```
Infrastructure
[ ] Railway PostgreSQL provisioned and connected
[ ] Upstash Redis provisioned and connected
[ ] All env vars set in Railway (backend)
[ ] All env vars set in Vercel (frontend)
[ ] GitHub → Railway auto-deploy configured
[ ] GitHub → Vercel auto-deploy configured

Database
[ ] prisma migrate deploy run on production DB
[ ] Admin seed script run exactly once
[ ] Admin login verified with production credentials

Application
[ ] Frontend builds successfully on Vercel
[ ] Backend starts successfully on Railway
[ ] POST /auth/register works
[ ] POST /auth/login works (student + admin)
[ ] GET /auth/me works with valid cookie
[ ] All 6 core modules respond correctly

Security
[ ] HTTPS enforced on both Vercel and Railway URLs
[ ] CORS restricted to Vercel frontend URL only
[ ] JWT cookie is HTTP-only and Secure
[ ] No .env file or secrets in GitHub repository
[ ] Rate limiter active on /auth routes

Post-Launch
[ ] Share platform URL with first test users
[ ] Monitor Railway logs for errors in first 24 hours
[ ] Note any bugs found in production for v1.1 patch
```

---

## 🔗 Phase Dependency Map

```
Phase 0 (Setup)
    └──▶ Phase 1 (Auth + DB)
              └──▶ Phase 2 (Attendance + Grades)
              │         └──▶ Phase 4 (Predictor + Resources)
              │                   └──▶ Phase 6 (Polish)
              └──▶ Phase 3 (Tasks)               │
              │         └──▶ Phase 6 (Polish) ◀──┘
              └──▶ Phase 5 (Admin Tools)
                        └──▶ Phase 6 (Polish)
                                    │
                                    ▼
                                 Launch
```

> Phase 5 (Admin Tools) requires Phase 2 to be complete because admin views depend on student grade and attendance data.

---

## 📈 Progress Tracker

| Phase | Status | Start | End | Notes |
|-------|--------|-------|-----|-------|
| Phase 0 — Setup | ✅ Complete | July 14, 2026 | July 15, 2026 | Client & Server scaffolded; Railway PostgreSQL & Upstash Redis verified |
| Phase 1 — Foundation | ⬜ Not Started | — | — | — |
| Phase 2 — Core Academic | ⬜ Not Started | — | — | — |
| Phase 3 — Task Scheduler | ⬜ Not Started | — | — | — |
| Phase 4 — Predictor + Resources | ⬜ Not Started | — | — | — |
| Phase 5 — Admin Tools | ⬜ Not Started | — | — | — |
| Phase 6 — Polish & Testing | ⬜ Not Started | — | — | — |
| Launch | ⬜ Not Started | — | — | — |

**Status Legend:** ⬜ Not Started &nbsp;|&nbsp; 🟡 In Progress &nbsp;|&nbsp; ✅ Complete &nbsp;|&nbsp; 🔴 Blocked

---

*End of Document — Version 1.0*
*Update the Progress Tracker above as each phase is completed.*
