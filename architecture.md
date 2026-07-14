# 🏗️ Architecture Document
## Student Academic Management Platform

---

**Document Version:** 1.1  
**Date:** July 14, 2026  
**Status:** Production-Ready Draft  
**Related PRD:** PRD_Student_Academic_Platform v1.1  
**Deployment Target:** Cloud (Production Only) — No local database setup

---

## 1. Architecture Overview

The platform follows a **3-tier client-server architecture**:

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                      │
│              React.js SPA (Single Page App)               │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼──────────────────────────────┐
│                    APPLICATION SERVER                      │
│                Node.js + Express.js (REST)                 │
│   ┌────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│   │ Auth Module│  │ Grade Engine │  │ Prediction Engine│ │
│   └────────────┘  └──────────────┘  └──────────────────┘ │
│   ┌────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│   │ Attendance │  │ Task Module  │  │  Admin Module    │ │
│   └────────────┘  └──────────────┘  └──────────────────┘ │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│                  DATA LAYER (Cloud Only)                   │
│   PostgreSQL on Railway (primary)  Redis on Upstash (KV)   │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | **React.js (Vite)** | Fast SPA, component-based, large ecosystem |
| Routing | **React Router v6** | Client-side routing with role-based guards |
| State Management | **Zustand** | Lightweight, simple global state |
| HTTP Client | **Axios** | Interceptors for auth headers & error handling |
| Charts & Graphs | **Recharts** | SGPA/CGPA graphs, attendance trends |
| UI Components | **shadcn/ui** | Accessible, customizable component library |
| Styling | **Tailwind CSS** | Utility-first, responsive design system |
| Calendar | **React Big Calendar** | Task scheduler calendar view |
| Form Handling | **React Hook Form + Zod** | Validation with schema-first approach |
| Notifications | **React Hot Toast** | In-app alerts and reminders |

### 2.2 Backend

| Layer | Technology | Reason |
|-------|-----------|--------|
| Runtime | **Node.js v20 LTS** | Non-blocking I/O, JavaScript throughout |
| Framework | **Express.js** | Minimal, flexible REST API |
| Authentication | **JWT (jsonwebtoken)** | Stateless auth with refresh tokens |
| Password Hashing | **bcrypt** | Industry standard, salted hashing |
| ORM | **Prisma** | Type-safe DB access, easy migrations |
| Validation | **Zod** | Schema-based request validation |
| Scheduling | **node-cron** | In-app reminder triggers |

### 2.3 Database (Cloud — Production Only)

| Layer | Technology | Hosting | Reason |
|-------|-----------|---------|--------|
| Primary DB | **PostgreSQL 15** | **Railway** | Managed cloud DB, automatic backups, always online |
| Cache / Sessions | **Redis** | **Upstash** | Serverless Redis, free tier, fast KV store |

> [!IMPORTANT]
> The database is hosted **entirely on the cloud**. There is no local database. All data is stored on Railway's PostgreSQL instance and is accessible 24/7 from anywhere.

### 2.4 Infrastructure & Hosting

| Component | Tool | Platform |
|-----------|------|----------|
| Frontend Hosting | Vercel | Cloud (free tier) |
| Backend Hosting | Railway | Cloud (free tier) |
| Database | Railway PostgreSQL | Cloud (always on) |
| Redis Cache | Upstash | Cloud (serverless) |
| Version Control | Git + GitHub | Cloud |
| Environment Secrets | Railway Env Variables | Cloud (encrypted) |
| Process Manager | PM2 | Runs on Railway server |

---

## 3. Frontend Architecture

### 3.1 Application Structure

```
src/
├── assets/                  # Static files, images, icons
├── components/
│   ├── common/              # Reusable UI: Button, Modal, Badge, Card
│   ├── layout/              # Sidebar, Navbar, PageWrapper
│   ├── attendance/          # AttendanceTable, AttendanceBadge
│   ├── grades/              # GradeRow, SGPADisplay, SemesterTab
│   ├── predictor/           # PredictionChart, GradeSlider
│   ├── tasks/               # TaskCard, KanbanBoard, CalendarView
│   ├── resources/           # NoteCard, LinkCard, PinnedBadge, NoteEditor
│   ├── admin/               # StudentTable, CourseTree, AnalyticsCard
│   └── charts/              # SGPALineChart, AttendanceBar
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── onboarding/
│   │   └── CourseSelection.jsx
│   ├── student/
│   │   ├── Dashboard.jsx
│   │   ├── Attendance.jsx
│   │   ├── Grades.jsx
│   │   ├── Predictor.jsx
│   │   ├── Tasks.jsx
│   │   └── Resources.jsx        ← Notes & links per subject
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── CourseManager.jsx
│       ├── StudentDirectory.jsx
│       ├── StudentProfile.jsx
│       └── AdminTasks.jsx
├── store/                   # Zustand global state slices
│   ├── authStore.js
│   ├── attendanceStore.js
│   ├── gradeStore.js
│   └── taskStore.js
├── hooks/                   # Custom React hooks
│   ├── useAttendance.js
│   ├── useGrades.js
│   └── useTasks.js
├── services/                # Axios API call functions
│   ├── api.js               # Axios instance with interceptors
│   ├── authService.js
│   ├── attendanceService.js
│   ├── gradeService.js
│   ├── taskService.js
│   ├── resourceService.js
│   └── adminService.js
├── utils/
│   ├── gradeCalculator.js   # SGPA / CGPA calculation logic
│   ├── attendanceUtils.js   # % calculation, classes-to-safe
│   └── dateUtils.js
├── routes/
│   ├── ProtectedRoute.jsx   # JWT-based route guard
│   └── AdminRoute.jsx       # Admin-only route guard
├── App.jsx
└── main.jsx
```

### 3.2 Routing Structure

```
/                       → Redirect to /login
/login                  → Login Page (public)
/register               → Register Page (public)
/onboarding             → Course Selection (student, first-login only)

/student/
  dashboard             → Student Dashboard
  attendance            → Attendance Tracker
  grades                → Grades & SGPA
  predictor             → CGPA Predictor
  tasks                 → Task Scheduler
  resources             → Subject Resources & Notes

/admin/
  dashboard             → Admin Analytics Dashboard
  courses               → Course & Subject Manager
  students              → Student Directory
  students/:id          → Individual Student Profile
  tasks                 → Admin Task Scheduler
```

### 3.3 Role-Based Route Guards

```
ProtectedRoute
└── Checks: JWT token valid + not expired
    └── If invalid → redirect to /login

AdminRoute (extends ProtectedRoute)
└── Checks: user.role === 'admin'
    └── If not admin → redirect to /student/dashboard
```

---

## 4. Backend Architecture

### 4.1 Folder Structure

```
server/
├── prisma/
│   ├── schema.prisma        # DB schema
│   └── migrations/          # Auto-generated DB migrations
├── src/
│   ├── config/
│   │   ├── db.js            # Prisma client instance
│   │   └── redis.js         # Redis client
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── admin.middleware.js     # Admin-only guard
│   │   ├── validate.middleware.js  # Zod schema validation
│   │   └── errorHandler.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── users/
│   │   │   ├── users.routes.js
│   │   │   ├── users.controller.js
│   │   │   └── users.service.js
│   │   ├── courses/
│   │   │   ├── courses.routes.js
│   │   │   ├── courses.controller.js
│   │   │   └── courses.service.js
│   │   ├── subjects/
│   │   │   ├── subjects.routes.js
│   │   │   ├── subjects.controller.js
│   │   │   └── subjects.service.js
│   │   ├── attendance/
│   │   │   ├── attendance.routes.js
│   │   │   ├── attendance.controller.js
│   │   │   └── attendance.service.js
│   │   ├── grades/
│   │   │   ├── grades.routes.js
│   │   │   ├── grades.controller.js
│   │   │   ├── grades.service.js
│   │   │   └── gradeEngine.js      # SGPA/CGPA calculation
│   │   ├── predictor/
│   │   │   ├── predictor.routes.js
│   │   │   ├── predictor.controller.js
│   │   │   └── predictor.service.js
│   │   ├── tasks/
│   │   │   ├── tasks.routes.js
│   │   │   ├── tasks.controller.js
│   │   │   └── tasks.service.js
│   │   ├── resources/
│   │   │   ├── resources.routes.js
│   │   │   ├── resources.controller.js
│   │   │   └── resources.service.js
│   │   └── admin/
│   │       ├── admin.routes.js
│   │       ├── admin.controller.js
│   │       └── admin.service.js
│   ├── utils/
│   │   ├── gradeMap.js             # Letter grade → grade point mapping
│   │   ├── jwtUtils.js
│   │   └── responseHelper.js
│   └── app.js                      # Express app entry
├── .env
└── server.js                       # HTTP server entry
```

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌─────────────┐
│   User   │──────▶│   Enrollment │◀──────│   Course    │
│          │  1:1  │ (course_id,  │  N:1  │             │
│id        │       │  semester)   │       │id           │
│name      │       └──────────────┘       │name         │
│email     │                              │code         │
│password  │       ┌──────────────┐       │department   │
│role      │──────▶│  Attendance  │       │total_sems   │
│          │  1:N  │              │       └──────┬──────┘
└────┬─────┘       │student_id    │              │ 1:N
     │             │subject_id    │       ┌──────▼──────┐
     │             │total_classes │       │   Subject   │
     │             │attended      │       │             │
     │             │semester_no   │       │id           │
     │             └──────────────┘       │name         │
     │                                    │code         │
     │             ┌──────────────┐       │course_id    │
     │────────────▶│    Grade     │       │semester_no  │
     │  1:N        │              │       │credit_hours │
     │             │student_id    │       │type         │
     │             │subject_id    │       │is_archived  │
     │             │letter_grade  │       └─────────────┘
     │             │grade_points  │
     │             │semester_no   │
     │             └──────────────┘
     │
     │             ┌──────────────┐
     └────────────▶│     Task     │
          1:N      │              │
                   │user_id       │
                   │subject_id?   │
                   │title         │
                   │description   │
                   │due_date      │
                   │priority      │
                   │category      │
                   │status        │
                   └──────────────┘
```

### 5.2 Prisma Schema

```prisma
model User {
  id              String       @id @default(cuid())
  name            String
  email           String       @unique
  passwordHash    String
  role            Role         @default(STUDENT)
  profilePic      String?
  courseId        String?
  currentSemester Int?
  isOnboarded     Boolean      @default(false)
  createdAt       DateTime     @default(now())

  attendance      Attendance[]
  grades          Grade[]
  tasks           Task[]
  course          Course?      @relation(fields: [courseId], references: [id])
}

enum Role {
  STUDENT
  ADMIN
}

model Course {
  id             String    @id @default(cuid())
  name           String
  code           String    @unique
  department     String
  totalSemesters Int
  createdAt      DateTime  @default(now())

  subjects       Subject[]
  students       User[]
}

model Subject {
  id            String      @id @default(cuid())
  name          String
  code          String
  courseId      String
  semesterNo    Int
  creditHours   Int         @default(0)
  type          SubjectType @default(THEORY)
  isArchived    Boolean     @default(false)
  createdAt     DateTime    @default(now())

  course        Course      @relation(fields: [courseId], references: [id])
  attendance    Attendance[]
  grades        Grade[]
  tasks         Task[]
}

enum SubjectType {
  THEORY
  LAB
  ELECTIVE
  AUDIT
}

model Attendance {
  id              String   @id @default(cuid())
  studentId       String
  subjectId       String
  semesterNo      Int
  totalClasses    Int      @default(0)
  attendedClasses Int      @default(0)
  updatedAt       DateTime @updatedAt

  student         User     @relation(fields: [studentId], references: [id])
  subject         Subject  @relation(fields: [subjectId], references: [id])

  @@unique([studentId, subjectId, semesterNo])
}

model Grade {
  id           String      @id @default(cuid())
  studentId    String
  subjectId    String
  semesterNo   Int
  letterGrade  LetterGrade
  gradePoints  Float
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  student      User        @relation(fields: [studentId], references: [id])
  subject      Subject     @relation(fields: [subjectId], references: [id])

  @@unique([studentId, subjectId, semesterNo])
}

enum LetterGrade {
  O
  A_PLUS
  A
  B_PLUS
  B
  C
  D
  F
}

model Task {
  id          String      @id @default(cuid())
  userId      String
  subjectId   String?
  title       String
  description String?
  dueDate     DateTime
  priority    Priority    @default(MEDIUM)
  category    Category    @default(PERSONAL)
  status      TaskStatus  @default(TODO)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  user        User        @relation(fields: [userId], references: [id])
  subject     Subject?    @relation(fields: [subjectId], references: [id])
}

enum Priority   { HIGH MEDIUM LOW }
enum Category   { ASSIGNMENT EXAM PROJECT PERSONAL OTHER }
enum TaskStatus  { TODO IN_PROGRESS DONE }

// Personal notes written by a student for a subject
model Note {
  id          String    @id @default(cuid())
  studentId   String
  subjectId   String
  semesterNo  Int
  title       String
  content     String    @db.Text
  tag         NoteTag   @default(GENERAL)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  student     User      @relation(fields: [studentId], references: [id])
  subject     Subject   @relation(fields: [subjectId], references: [id])
}

enum NoteTag {
  LECTURE_NOTES
  SUMMARY
  FORMULA_SHEET
  REVISION
  GENERAL
}

// Resource links — personal (student) or pinned (admin)
model Resource {
  id           String       @id @default(cuid())
  subjectId    String
  addedById    String       // student (personal) or admin (pinned)
  semesterNo   Int
  title        String
  url          String
  type         ResourceType @default(OTHER)
  isPinned     Boolean      @default(false)  // true = added by admin for all students
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  subject      Subject      @relation(fields: [subjectId], references: [id])
  addedBy      User         @relation(fields: [addedById], references: [id])
}

enum ResourceType {
  YOUTUBE
  ARTICLE
  GOOGLE_DRIVE
  OTHER
}
```

---

## 6. REST API Design

### 6.1 Base URL
```
/api/v1
```

### 6.2 Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register new student |
| POST | `/auth/login` | Public | Login (student or admin) |
| POST | `/auth/logout` | Auth | Invalidate token |
| GET | `/auth/me` | Auth | Get current user profile |
| PATCH | `/auth/me` | Auth | Update profile (name, password) |

### 6.3 Onboarding

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/onboarding/select-course` | Student | Set course + semester |

### 6.4 Courses

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/courses` | Auth | List all courses |
| POST | `/courses` | Admin | Create new course |
| PATCH | `/courses/:id` | Admin | Edit course |
| DELETE | `/courses/:id` | Admin | Delete course |

### 6.5 Subjects

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/courses/:id/subjects` | Auth | Get subjects by course |
| GET | `/courses/:id/subjects?semester=2` | Auth | Filter by semester |
| POST | `/courses/:id/subjects` | Admin | Create subject |
| PATCH | `/subjects/:id` | Admin | Edit subject |
| DELETE | `/subjects/:id` | Admin | Archive subject |

### 6.6 Attendance

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/attendance/me` | Student | Get own attendance (all subjects) |
| POST | `/attendance/log` | Student | Log attendance for a subject |
| PATCH | `/attendance/:id` | Student | Update attendance record |
| GET | `/attendance/student/:id` | Admin | View student's attendance |
| PATCH | `/attendance/student/:id/:subjectId` | Admin | Edit student attendance |

### 6.7 Grades

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/grades/me` | Student | Get own grades (all semesters) |
| POST | `/grades` | Student | Enter/update a grade |
| GET | `/grades/me/sgpa` | Student | Get SGPA per semester |
| GET | `/grades/me/cgpa` | Student | Get current CGPA |
| GET | `/grades/student/:id` | Admin | View student's grades |
| PATCH | `/grades/:id` | Admin | Edit student grade |

### 6.8 CGPA Predictor

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/predictor/simulate` | Student | Run CGPA what-if simulation |

**Request Body:**
```json
{
  "targetCGPA": 8.5,
  "futureSemesters": [
    {
      "semesterNo": 3,
      "subjects": [
        { "subjectId": "abc123", "expectedGrade": "A" },
        { "subjectId": "def456", "expectedGrade": "B+" }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "currentCGPA": 8.45,
  "predictedCGPA": 8.62,
  "bestCaseCGPA": 9.10,
  "worstCaseCGPA": 7.20,
  "minSGPANeeded": 8.80,
  "trajectory": [
    { "semester": 1, "sgpa": 8.45, "type": "actual" },
    { "semester": 2, "sgpa": 8.62, "type": "predicted" }
  ]
}
```

### 6.9 Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/tasks/me` | Auth | Get own tasks |
| POST | `/tasks` | Auth | Create task |
| PATCH | `/tasks/:id` | Auth | Update task (status, priority) |
| DELETE | `/tasks/:id` | Auth | Delete task |
| POST | `/tasks/broadcast` | Admin | Broadcast announcement to all students |

### 6.10 Admin

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/students` | Admin | List all students |
| GET | `/admin/students/:id` | Admin | Full student profile |
| PATCH | `/admin/students/:id/semester` | Admin | Promote to next semester |
| PATCH | `/admin/students/:id/course` | Admin | Change student's course |
| GET | `/admin/analytics` | Admin | Platform-wide analytics |
| GET | `/admin/at-risk` | Admin | Students with low attendance or CGPA |

### 6.11 Resources & Notes

**Personal Notes (Student)**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/notes/me?subjectId=&semester=` | Student | Get own notes for a subject |
| POST | `/notes` | Student | Create a note |
| PATCH | `/notes/:id` | Student | Edit own note |
| DELETE | `/notes/:id` | Student | Delete own note |
| GET | `/notes/me/search?q=&tag=` | Student | Search notes by keyword or tag |

**Resource Links (Student — personal)**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/resources?subjectId=&semester=` | Auth | Get resources for a subject (personal + pinned) |
| POST | `/resources` | Student | Add a personal resource link |
| PATCH | `/resources/:id` | Student | Edit own resource link |
| DELETE | `/resources/:id` | Student | Delete own resource link |

**Pinned Resources (Admin)**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/resources/pin` | Admin | Pin a resource to a subject for all students |
| PATCH | `/resources/pin/:id` | Admin | Edit a pinned resource |
| DELETE | `/resources/pin/:id` | Admin | Remove a pinned resource |

---

## 7. Authentication Flow

### 7.1 Student Registration & Login

```
[Client]                        [Server]                   [DB]
   │                                │                        │
   │── POST /auth/register ────────▶│                        │
   │   { name, email, password }    │── hash password ──────▶│
   │                                │── INSERT user ─────────▶│
   │◀─ { message: "registered" } ──│                        │
   │                                │                        │
   │── POST /auth/login ───────────▶│                        │
   │   { email, password }          │── find user ──────────▶│
   │                                │── bcrypt compare       │
   │                                │── sign JWT             │
   │◀─ { accessToken, user } ──────│                        │
   │                                │                        │
   │── GET /api/* ─────────────────▶│                        │
   │   Authorization: Bearer <JWT>  │── verify JWT           │
   │                                │── attach user to req   │
   │◀─ { data } ───────────────────│                        │
```

### 7.2 JWT Token Structure

```json
{
  "sub": "user_cuid_here",
  "email": "student@university.edu",
  "role": "STUDENT",
  "iat": 1720951200,
  "exp": 1721037600
}
```

- **Access Token:** Expires in **24 hours**
- **Stored in:** HTTP-only cookie (secure, sameSite=strict)

---

## 8. Grade Engine (Core Logic)

### 8.1 Grade Point Map

```javascript
// server/src/utils/gradeMap.js

const GRADE_POINTS = {
  O:      10,
  A_PLUS:  9,
  A:       8,
  B_PLUS:  7,
  B:       6,
  C:       5,
  D:       4,
  F:       0,
};
```

### 8.2 SGPA Calculator

```javascript
function calculateSGPA(subjects) {
  let totalWeighted = 0;
  let totalCredits   = 0;

  for (const subject of subjects) {
    if (subject.creditHours === 0) continue; // skip audit subjects
    const gradePoints = GRADE_POINTS[subject.letterGrade];
    totalWeighted += subject.creditHours * gradePoints;
    totalCredits  += subject.creditHours;
  }

  if (totalCredits === 0) return 0;
  return parseFloat((totalWeighted / totalCredits).toFixed(2));
}
```

### 8.3 CGPA Calculator

```javascript
function calculateCGPA(semesters) {
  let totalWeighted = 0;
  let totalCredits  = 0;

  for (const sem of semesters) {
    totalWeighted += sem.sgpa * sem.totalCredits;
    totalCredits  += sem.totalCredits;
  }

  if (totalCredits === 0) return 0;
  return parseFloat((totalWeighted / totalCredits).toFixed(2));
}
```

### 8.4 CGPA Prediction

```javascript
function predictCGPA(completedSemesters, futureSemesters) {
  const futureProcessed = futureSemesters.map(sem => ({
    sgpa:         calculateSGPA(sem.subjects),
    totalCredits: sem.subjects
                    .filter(s => s.creditHours > 0)
                    .reduce((sum, s) => sum + s.creditHours, 0),
  }));

  return calculateCGPA([...completedSemesters, ...futureProcessed]);
}
```

---

## 9. Attendance Logic

```javascript
// utils/attendanceUtils.js

function getAttendanceSummary(total, attended) {
  const percentage = total === 0 ? 0 : (attended / total) * 100;

  // Classes needed to reach 75%
  // 0.75*(total + x) = attended + x → x = (0.75*total - attended) / 0.25
  const classesNeededFor75 = percentage >= 75
    ? 0
    : Math.ceil((0.75 * total - attended) / 0.25);

  // Max classes can miss and still be >= 75%
  // attended / (total + x) >= 0.75 → x = floor(attended/0.75 - total)
  const classesCanMiss = Math.max(
    0,
    Math.floor(attended / 0.75 - total)
  );

  const status =
    percentage >= 75 ? 'SAFE' :
    percentage >= 65 ? 'WARNING' : 'CRITICAL';

  return {
    total, attended,
    percentage: parseFloat(percentage.toFixed(2)),
    classesNeededFor75,
    classesCanMiss,
    status,
  };
}
```

---

## 10. Production Deployment Architecture

> [!IMPORTANT]
> This platform is designed for **cloud-only production deployment**. All services — frontend, backend, database, and cache — run on cloud platforms. No local setup is required to run the live application.

```
┌─────────────────────────────────────────────────────┐
│                   User's Browser                     │
│          (Any device, anywhere in the world)          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (SSL)
┌──────────────────────▼──────────────────────────────┐
│                     VERCEL                           │
│            Frontend — React.js Build                 │
│         Global CDN — Fast worldwide access           │
│              URL: yourdomain.vercel.app              │
└──────────────────────┬──────────────────────────────┘
                       │ REST API over HTTPS
┌──────────────────────▼──────────────────────────────┐
│                    RAILWAY                           │
│          Backend — Node.js + Express.js              │
│              Managed by PM2 process                  │
│           URL: yourapp.railway.app/api/v1            │
└──────────┬────────────────────────┬─────────────────┘
           │                        │
┌──────────▼──────────┐  ┌─────────▼───────────┐
│  RAILWAY            │  │  UPSTASH             │
│  PostgreSQL 15      │  │  Redis (Serverless)  │
│  Primary Database   │  │  Sessions & Cache    │
│  Auto-backups daily │  │  Free tier           │
└─────────────────────┘  └─────────────────────┘
```

### Platform Summary

| Service | Platform | URL Pattern | Cost |
|---------|----------|-------------|------|
| Frontend | Vercel | `yourapp.vercel.app` | Free |
| Backend API | Railway | `yourapi.railway.app` | Free tier |
| PostgreSQL DB | Railway | Internal connection | Free tier |
| Redis Cache | Upstash | Internal connection | Free tier |

### Deployment Flow

```
Developer pushes code to GitHub
         │
         ├──▶ Vercel detects frontend changes → Auto-builds & deploys React app
         │
         └──▶ Railway detects backend changes → Auto-builds & deploys Node.js server
                        │
                        └──▶ Prisma migrations run → PostgreSQL schema updated
```

### Production Environment Variables (Set in Railway Dashboard)

```env
# Application
NODE_ENV=production
PORT=5000

# Database (auto-provided by Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@railway.internal:5432/student_platform

# Redis (from Upstash dashboard)
REDIS_URL=rediss://default:token@upstash-endpoint:6380

# JWT
JWT_SECRET=generate_a_long_random_secret_here
JWT_EXPIRES_IN=24h

# Frontend URL (for CORS)
FRONTEND_URL=https://yourapp.vercel.app

# Admin Account (used only once during DB seed)
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=SecureAdminPass123!
```

### Frontend Environment Variables (Set in Vercel Dashboard)

```env
VITE_API_BASE_URL=https://yourapi.railway.app/api/v1
```

---

## 11. Security Considerations

| Threat | Mitigation |
|--------|-----------|
| Unauthorized access | JWT verification middleware on all private routes |
| Admin impersonation | Role checked server-side on every admin endpoint |
| SQL injection | Prisma ORM with parameterized queries |
| Brute force login | Rate limiter: 10 requests/min on `/auth` routes |
| Weak passwords | Minimum 8 chars, at least 1 number enforced via Zod |
| Cross-site attacks | HTTP-only cookies; CORS restricted to frontend origin |
| Data leakage | Students can only query their own data (userId from JWT) |

---

## 12. Key Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Single admin account | Pre-seeded via DB script | Simplifies admin management, no self-registration risk |
| Grading formula server-side | Grade engine runs on backend only | Prevents client-side tampering of SGPA/CGPA |
| 0-credit subjects excluded | Hardcoded in grade engine | Matches university policy confirmed from grade card |
| Attendance threshold | Fixed at 75%, not configurable | Per PRD specification |
| File import/export | Not implemented | Out of scope for v1.0 |
| JWT in HTTP-only cookie | More secure than localStorage | Prevents XSS token theft |
| Database location | Cloud only (Railway) | Production-ready from day one; no local DB needed |
| No local development DB | Cloud DB used always | Consistent data across all environments; avoids sync issues |
| Notes privacy | Student notes are private | Other students cannot read personal notes |
| Admin pinned resources | Stored with isPinned=true flag | Simple single-table approach, no separate admin resource table |

---

*End of Document — Version 1.1*  
*Updated: Production-only cloud deployment — Railway (DB + Backend), Vercel (Frontend), Upstash (Redis). No local database setup.*
