# 📋 Project Rules & Development Guidelines
## Student Academic Management Platform

---

**Version:** 1.1  
**Date:** July 14, 2026  
**Status:** Active — All contributors must follow these rules  

> [!IMPORTANT]
> These rules are mandatory for all development on this project. Every piece of code written must conform to these guidelines. No exceptions without team discussion.

---

## 1. 🗂️ Project Structure Rules

### 1.1 General
- The project is split into two root directories:
  ```
  /client   → React frontend (Vite)
  /server   → Node.js + Express backend
  ```
- Never mix frontend and backend code.
- Never put business logic in route files — use service files.
- Never put database queries in controller files — use service files.

### 1.2 Responsibility of Each Layer

| Layer | Responsibility | Must NOT Do |
|-------|---------------|-------------|
| `routes.js` | Define endpoint + call controller | No logic, no DB calls |
| `controller.js` | Handle request/response, call service | No DB calls directly |
| `service.js` | Business logic + DB calls via Prisma | No `req`/`res` objects |
| `middleware` | Intercept request, auth checks, validation | No business logic |

---

## 2. 📝 Naming Conventions

### 2.1 Files & Folders

| Type | Convention | Example |
|------|-----------|---------|
| Folders | `kebab-case` | `course-manager/`, `auth/` |
| React components | `PascalCase.jsx` | `GradeRow.jsx`, `AttendanceTable.jsx` |
| Non-component JS files | `camelCase.js` | `gradeEngine.js`, `authService.js` |
| Route/controller/service | `module.type.js` | `grades.routes.js`, `grades.service.js` |
| CSS modules | `ComponentName.module.css` | `GradeRow.module.css` |
| Environment files | `.env` | Never commit `.env` to Git |

### 2.2 Variables & Functions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | `camelCase` | `totalCredits`, `attendedClasses` |
| Constants | `SCREAMING_SNAKE_CASE` | `GRADE_POINTS`, `ATTENDANCE_THRESHOLD` |
| Functions | `camelCase` verb-first | `calculateSGPA()`, `getStudentProfile()` |
| React components | `PascalCase` | `AttendanceBadge`, `SGPAChart` |
| Boolean variables | `is/has/can` prefix | `isOnboarded`, `hasLowAttendance`, `canEdit` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleDelete` |

### 2.3 Database (Prisma)

| Type | Convention | Example |
|------|-----------|---------|
| Model names | `PascalCase` singular | `User`, `Subject`, `Grade` |
| Field names | `camelCase` | `studentId`, `gradePoints`, `creditHours` |
| Enum names | `PascalCase` | `Role`, `LetterGrade`, `SubjectType` |
| Enum values | `SCREAMING_SNAKE_CASE` | `A_PLUS`, `LECTURE_NOTES`, `IN_PROGRESS` |

### 2.4 API Endpoints

| Rule | Example |
|------|---------|
| Lowercase, kebab-case | `/api/v1/select-course` |
| Use nouns, not verbs | `/students` not `/getStudents` |
| Plural for collections | `/courses`, `/subjects`, `/grades` |
| Nested for ownership | `/courses/:id/subjects` |
| Use query params for filters | `/notes?subjectId=x&semester=2` |

---

## 3. 🔀 Git Rules

### 3.1 Branch Naming

```
main          → Production-ready code only
dev           → Active development branch
feature/xxx   → New features (branch from dev)
fix/xxx       → Bug fixes (branch from dev)
hotfix/xxx    → Critical production fixes (branch from main)
```

**Examples:**
```
feature/attendance-module
feature/cgpa-predictor
fix/sgpa-calculation-error
hotfix/login-token-expiry
```

### 3.2 Commit Message Format

Follow **Conventional Commits** specification:

```
<type>(<scope>): <short description>

Types:
  feat      → New feature
  fix       → Bug fix
  docs      → Documentation changes
  style     → Formatting, no logic change
  refactor  → Code restructuring
  test      → Adding tests
  chore     → Dependency updates, config changes
```

**Examples:**
```
feat(grades): add SGPA auto-calculation on grade entry
fix(attendance): correct classes-needed-for-75 formula
docs(prd): update resources feature requirements
chore(deps): upgrade prisma to v5.10
refactor(auth): extract token signing into jwtUtils
```

### 3.3 Git Rules (Hard Rules)

- ✅ Always pull latest `dev` before creating a new branch
- ✅ Create a Pull Request (PR) for every feature — no direct push to `main` or `dev`
- ✅ PR must have a clear title and description
- ❌ Never commit secrets, API keys, or `.env` files
- ❌ Never push directly to `main`
- ❌ Never force push to `main` or `dev`
- ❌ Never commit `node_modules/`

### 3.4 .gitignore Must Include

```
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log
prisma/dev.db
```

---

## 4. ⚛️ Frontend Rules (React)

### 4.1 Component Rules

- **One component per file** — no exceptions.
- Component files must have a **default export**.
- Keep components **small and focused** — if a component exceeds 200 lines, split it.
- **No raw API calls inside components** — use service files or custom hooks.
- **No business logic inside components** — move to custom hooks or utils.

```jsx
// ✅ CORRECT — clean component
function AttendanceBadge({ percentage }) {
  const status = getAttendanceStatus(percentage); // logic in utils
  return <span className={`badge badge--${status}`}>{percentage}%</span>;
}

// ❌ WRONG — logic inside component
function AttendanceBadge({ percentage }) {
  const status = percentage >= 75 ? 'safe' : percentage >= 65 ? 'warning' : 'critical';
  return <span className={`badge badge--${status}`}>{percentage}%</span>;
}
```

### 4.2 State Management Rules

- Use **local state** (`useState`) for UI-only state (modals, toggles).
- Use **Zustand store** for shared/global state (user, grades, attendance).
- Use **React Query** or **Axios** with hooks for server state (API data).
- Never store sensitive data (passwords, tokens) in Zustand or localStorage.

### 4.3 Styling Rules

- Use **Tailwind CSS** utility classes for styling.
- No inline styles (`style={{...}}`) except for dynamic values like chart colors.
- No raw `<style>` tags inside components.
- Use **consistent spacing scale**: `p-2, p-4, p-6, p-8` (never `p-3, p-5, p-7`).
- All interactive elements must have **hover and focus states**.
- Dark mode must be considered for every new component.

### 4.4 API Call Rules

- All API calls must go through `src/services/` files.
- Use Axios instance from `api.js` — never import Axios directly in components.
- Always handle loading state, success state, and error state.

```jsx
// ✅ CORRECT
const { data, isLoading, error } = useGrades();

// ❌ WRONG — raw axios in component
const res = await axios.get('/api/v1/grades/me');
```

### 4.5 Form Rules

- All forms must use **React Hook Form**.
- All form validation must use **Zod schemas**.
- Show validation errors inline under each field.
- Disable the submit button while the form is submitting.

### 4.6 Route Guard Rules

- All student pages must be wrapped in `<ProtectedRoute>`.
- All admin pages must be wrapped in `<AdminRoute>`.
- Never expose admin routes to non-admin users.

---

## 5. 🖥️ Backend Rules (Node.js + Express)

### 5.1 API Response Format

All API responses must follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Grades fetched successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Subject not found",
  "error": "NOT_FOUND"
}
```

**Never** return raw error objects or stack traces to the client in production.

### 5.2 HTTP Status Codes

| Situation | Status Code |
|-----------|------------|
| Success (fetch/update) | `200 OK` |
| Created successfully | `201 Created` |
| No content (delete) | `204 No Content` |
| Bad request / validation fail | `400 Bad Request` |
| Unauthenticated | `401 Unauthorized` |
| Forbidden (wrong role) | `403 Forbidden` |
| Resource not found | `404 Not Found` |
| Server error | `500 Internal Server Error` |

### 5.3 Validation Rules

- **All** incoming request bodies must be validated using **Zod schemas** in middleware.
- Validation happens in middleware — controller receives clean, validated data.
- Reject and return `400` immediately if validation fails.

```javascript
// ✅ CORRECT — validate in middleware
const gradeSchema = z.object({
  subjectId: z.string().cuid(),
  letterGrade: z.enum(['O', 'A_PLUS', 'A', 'B_PLUS', 'B', 'C', 'D', 'F']),
  semesterNo: z.number().int().min(1).max(12),
});
```

### 5.4 Authentication Rules

- Every protected route must use `auth.middleware.js`.
- Every admin-only route must use both `auth.middleware.js` AND `admin.middleware.js`.
- Never trust data from `req.body` for `userId` — always use `req.user.id` from JWT.
- Students can only access their own data — always filter by `req.user.id`.

```javascript
// ✅ CORRECT — use userId from JWT
const grades = await gradeService.getGrades(req.user.id);

// ❌ WRONG — never trust client-provided userId
const grades = await gradeService.getGrades(req.body.userId);
```

### 5.5 Error Handling Rules

- Use a **centralized error handler** (`errorHandler.js` middleware).
- All async route handlers must be wrapped in `try/catch` or use `express-async-errors`.
- Log errors server-side but never expose stack traces in responses.

```javascript
// ✅ CORRECT
const getGrades = async (req, res, next) => {
  try {
    const grades = await gradeService.getGrades(req.user.id);
    res.json({ success: true, data: grades });
  } catch (err) {
    next(err); // pass to centralized error handler
  }
};
```

### 5.6 Grade Engine Rules

- The SGPA/CGPA calculation must **only** happen in `gradeEngine.js`.
- The grade point map (`GRADE_POINTS`) must be the single source of truth.
- **Zero-credit subjects must always be excluded** from SGPA/CGPA calculations.
- Never hardcode grade points anywhere except `gradeMap.js`.

```javascript
// ✅ CORRECT — import from single source
const { GRADE_POINTS } = require('../utils/gradeMap');

// ❌ WRONG — hardcoding grade points anywhere else
const points = grade === 'A' ? 8 : grade === 'B' ? 6 : 0;
```

### 5.7 Attendance Rules

- Attendance threshold is **fixed at 75%** — never make it a variable or config.
- The formula for `classesNeededFor75` must use:
  ```
  Math.ceil((0.75 * total - attended) / 0.25)
  ```
- The formula for `classesCanMiss` must use:
  ```
  Math.floor(attended / 0.75 - total)
  ```
- Always return `0` if the result is negative (never negative values).

---

## 6. 🗄️ Database Rules (Prisma)

### 6.1 Schema Rules

- Every model must have an `id` field as `@id @default(cuid())`.
- Every model must have `createdAt DateTime @default(now())`.
- Mutable models must have `updatedAt DateTime @updatedAt`.
- Never use raw SQL — always use Prisma client methods.
- Never delete records permanently unless explicitly required — use `isArchived` soft-delete flags.

### 6.2 Migration Rules

- Run `prisma migrate dev` for development schema changes.
- Run `prisma migrate deploy` for production deployments.
- Never manually edit migration files after they are applied.
- Always test migrations on a staging database before production.
- Migration names must be descriptive:
  ```
  ✅ add_resources_and_notes_models
  ✅ add_is_archived_to_subjects
  ❌ migration1
  ❌ update
  ```

### 6.3 Query Rules

- Always select only required fields — never use bare `findMany()` without `select`.
- Paginate any list query that could return more than 50 records.
- Use `@@unique` constraints at the DB level for business uniqueness rules.
- Always use transactions (`$transaction`) for operations that modify multiple tables.

```javascript
// ✅ CORRECT — select only needed fields
const students = await prisma.user.findMany({
  where: { role: 'STUDENT' },
  select: { id: true, name: true, email: true, currentSemester: true }
});

// ❌ WRONG — returns all fields including password hash
const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
```

### 6.4 Seeding Rules

- Admin account must be created via `prisma/seed.js` only.
- Seed script must be idempotent (safe to run multiple times without creating duplicates).
- Use `upsert` not `create` in seed scripts.

```javascript
// ✅ CORRECT — idempotent seed
await prisma.user.upsert({
  where: { email: process.env.ADMIN_EMAIL },
  update: {},
  create: {
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    role: 'ADMIN',
  }
});
```

---

## 7. 🔐 Security Rules

- **Never** store plain-text passwords — always use `bcrypt` with salt rounds ≥ 10.
- **Never** put secrets in code — use environment variables only.
- **Never** log sensitive data (passwords, tokens, personal info) to console.
- **Always** verify the JWT on every protected request.
- **Always** check the user's role server-side — never trust the client.
- **Always** sanitize and validate all user inputs before processing.
- Rate-limit all `/auth` endpoints to **10 requests per minute per IP**.
- CORS must only allow the official frontend domain — no wildcards (`*`) in production.
- JWT must be stored in **HTTP-only cookies** — never in localStorage.
- Admin credentials must never be hardcoded — read from environment variables only.

---

## 8. 🌍 Environment Variable Rules

- All environment variables must be documented in a `.env.example` file.
- `.env` files must **never** be committed to Git.
- Use descriptive names in `SCREAMING_SNAKE_CASE`.
- Group variables by purpose with comments.

**`.env.example` template:**
```env
# App
NODE_ENV=production
PORT=5000

# Database (Railway)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (Upstash)
REDIS_URL=rediss://default:token@endpoint:6380

# JWT
JWT_SECRET=replace_with_long_random_string
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=https://yourapp.vercel.app

# Admin Credentials (used in seed only)
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=replace_with_secure_password
```

---

## 9. 📚 Resources & Notes Rules

- A student can only read, edit, or delete **their own** notes and resource links.
- Admin-pinned resources use `isPinned: true` in the `Resource` model.
- When fetching resources for a subject, **always** return:
  1. Pinned resources (admin) — shown first, at top
  2. Personal resources (student) — shown below
- Note content must be stored as plain text or sanitized HTML only.
- URLs in resource links must be validated as proper URLs before saving.
- Notes and resources are scoped by **both** `subjectId` AND `semesterNo` — always filter by both.

### 9.1 Weekly Timetable Rules
- Weekly class schedules (`ClassSchedule`) must be scoped strictly by both `studentId`, `subjectId`, and `semesterNo`.
- When fetching or saving a timetable for a subject, always verify that the subject's `semesterNo` matches the student's `currentSemester`. Never allow saving class days for a subject belonging to another semester.
- If a subject has 0 saved `ClassSchedule` rows, the frontend falls back to treating all 7 days of the week as valid class days (`[0, 1, 2, 3, 4, 5, 6]`).

### 9.2 Academic Calendar Hub Scoping Rules
- Academic events (`AcademicEvent`) support a 3-tier visibility scope controlled by `courseId` and `semesterNo`:
  1. **Universal / Global:** `courseId` is `null` AND `semesterNo` is `null` (visible to every student across the entire university).
  2. **Course-Wide:** `courseId` is set AND `semesterNo` is `null` (visible to all students enrolled in that specific course, across all semesters).
  3. **Semester-Scoped:** both `courseId` and `semesterNo` are set (strictly isolated to students in that course AND that specific semester).
- Student-facing queries (`GET /api/v1/academic-events`) MUST filter strictly server-side using `req.user.courseId` and `req.user.currentSemester`. Never trust client-supplied course or semester query params for student endpoints.
- Student endpoints must only return public read-only fields (`id, title, description, date, type, courseId, semesterNo, course`) and must never leak `createdById` or internal admin metadata.
- Admin creation, update, and deletion (`POST/PATCH/DELETE /api/v1/admin/academic-events`) require strict `ADMIN` role enforcement.

---

## 10. 🧪 Code Quality Rules

### 10.1 Code Style
- Use **2 spaces** for indentation (no tabs).
- Maximum line length: **100 characters**.
- Always use **single quotes** in JavaScript.
- Always use **semicolons** at end of statements.
- Use **arrow functions** for callbacks and short functions.
- Use **async/await** — never `.then()/.catch()` chains.

### 10.2 Comments & Documentation
- Write comments for **complex logic only** — not obvious code.
- Every service function must have a **JSDoc comment** describing what it does.
- Every API endpoint must have an inline comment describing its purpose.

```javascript
/**
 * Calculates SGPA for a given list of subject grades.
 * Excludes subjects with 0 credit hours (audit subjects).
 * @param {Array} subjects - Array of { letterGrade, creditHours }
 * @returns {number} SGPA rounded to 2 decimal places
 */
function calculateSGPA(subjects) { ... }
```

### 10.3 What NOT to Do
- ❌ No `console.log` in production code — use a logger.
- ❌ No commented-out dead code committed to the repo.
- ❌ No `any` type if TypeScript is ever introduced.
- ❌ No magic numbers — use named constants.
- ❌ No duplicate code — extract into shared utilities.

---

## 11. 🚀 Deployment Rules

- Production deployments happen **only from the `main` branch**.
- Never deploy code that has not been reviewed via a Pull Request.
- Always run `prisma migrate deploy` before starting the production server after schema changes.
- The admin account seed script must be run **exactly once** on initial production setup.
- Environment variables must be set in **Railway Dashboard** (backend) and **Vercel Dashboard** (frontend) — never in code.
- Always verify the deployment is working by testing the `/auth/me` endpoint after deploy.

---

## 12. ❌ Absolute Don'ts

| Rule | Why |
|------|-----|
| Never expose CGPA/SGPA calculation logic on the frontend | Prevents tampering |
| Never allow a student to access another student's data | Privacy violation |
| Never allow multiple admin accounts to be created | PRD specification |
| Never store file uploads locally | No file storage in scope |
| Never use CSV import/export | Out of scope per PRD |
| Never make the 75% attendance threshold configurable | PRD specification |
| Never use a grading formula different from the confirmed one | Academic accuracy |
| Never commit to `main` without a PR | Code quality & safety |
| Never store JWT in localStorage | XSS vulnerability |

---

## 13. 🤖 AI Usage Boundaries

> [!IMPORTANT]
> AI tools (e.g., GitHub Copilot, ChatGPT, Claude, Cursor) may be used to assist development — but within strict boundaries. AI-generated code is **not automatically trusted** and must always be reviewed before use.

---

### 13.1 ✅ What AI CAN Do

| Allowed Task | Condition |
|-------------|----------|
| Generate boilerplate code (routes, controllers, models) | Must be reviewed before use |
| Suggest component structure or folder layout | Must match architecture.md |
| Write JSDoc comments for functions | Must be accurate |
| Help debug errors or explain concepts | Always verify the explanation |
| Draft Zod validation schemas | Must be tested with edge cases |
| Write Prisma query snippets | Must be reviewed for field selection |
| Suggest Tailwind class combinations for UI | Must follow styling rules in Section 4.3 |
| Generate utility functions (date formatting, string helpers) | Must have unit tests |
| Write API endpoint stubs | Must follow response format in Section 5.1 |

---

### 13.2 ❌ What AI CANNOT Do

| Prohibited Task | Reason |
|----------------|--------|
| Write or modify the SGPA / CGPA formula | Formula is confirmed and locked — no AI variation allowed |
| Write or modify the attendance threshold logic | Fixed at 75% per PRD — no AI changes |
| Create or modify the admin account seeding logic | Security-critical — human review mandatory |
| Generate or suggest JWT secret values | Security risk — secrets must come from secure generators only |
| Modify Prisma migration files | Migrations are immutable once applied |
| Define role-based access logic | Auth boundaries are critical — must be human-written and reviewed |
| Make decisions about what goes Out of Scope | Only the PRD defines scope |
| Change the grading scale or grade point values | Confirmed from university grade card — locked |
| Auto-commit or auto-deploy any generated code | All code must go through Git PR process |
| Access, store, or suggest use of real student data | Privacy — never use real data in development or AI prompts |

---

### 13.3 🔍 AI Code Review Checklist

Before using any AI-generated code, verify the following:

```
[ ] Does it follow naming conventions from Section 2?
[ ] Does it match the folder structure from architecture.md?
[ ] Does it use the correct API response format (Section 5.1)?
[ ] Does it use req.user.id (not req.body.userId) for auth?
[ ] Does it select only required fields from the database?
[ ] Does it handle errors with try/catch and next(err)?
[ ] Does it NOT hardcode any grade points or thresholds?
[ ] Does it NOT expose sensitive data in responses?
[ ] Does it NOT store anything in localStorage?
[ ] Is it covered by at least a manual test before merging?
```

---

### 13.4 📌 AI Prompt Rules

When prompting an AI tool to generate code for this project:

- ✅ **Always provide context** — share the relevant section of `architecture.md` or `rules.md` with the AI so it generates consistent code.
- ✅ **Specify the exact module** — e.g., *"Generate the grades.service.js for the grades module following our Prisma schema"*.
- ✅ **Mention the constraints** — e.g., *"Exclude 0-credit subjects from SGPA calculation"*.
- ❌ **Never paste real student data** into AI prompts — use dummy/mock data only.
- ❌ **Never paste `.env` values** or production credentials into AI prompts.
- ❌ **Never ask AI to modify** the grade engine, attendance formula, or auth middleware without human co-review.
- ❌ **Never trust AI explanations of the SGPA formula** — use only the formula confirmed in the PRD (Section 7.2).

---

### 13.5 🧠 AI for Documentation

- AI **may** help draft documentation, comments, or README content.
- All AI-drafted documentation must be **fact-checked** against the PRD and architecture documents.
- AI must **not** alter or rewrite the PRD or architecture documents autonomously.
- Any documentation changes suggested by AI must go through the same PR review process as code.

---

### 13.6 Summary — AI Boundary Quick Reference

```
✅ USE AI FOR:                    ❌ DO NOT USE AI FOR:
─────────────────────────────    ──────────────────────────────────
Boilerplate & scaffolding        SGPA / CGPA formula changes
Debugging & error analysis       Attendance threshold logic
Zod schemas & validation         JWT / auth logic (unreviewed)
UI component suggestions         Prisma migration edits
Utility functions                Role-based access decisions
Comments & documentation         Defining project scope
Query building (reviewed)        Real student data in prompts
API stubs                        Secrets or credentials
```

---

*End of Document — Version 1.1*  
*These rules apply to all development work on this project and must be followed strictly.*  
*Updated: Added Section 13 — AI Usage Boundaries.*
