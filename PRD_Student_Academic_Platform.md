# 📘 Product Requirements Document (PRD)
## Student Academic Management Platform

---

**Document Version:** 1.1  
**Date:** July 14, 2026  
**Status:** Draft — Awaiting Stakeholder Approval  
**Author:** [Your Name / Team Name]  
**Audience:** Engineering, Design, QA, Stakeholders  

---

## 1. Overview

The **Student Academic Management Platform** is a web-based application designed to help university students take full control of their academic life — from tracking attendance and grades to scheduling tasks and predicting future performance. The platform also equips the administrator with powerful tools to manage academic data, subjects, courses, and monitor student progress across the university.

---

## 2. Problem Statement

University students currently struggle to:
- Track attendance across multiple subjects without a unified view.
- Calculate or predict their SGPA and CGPA without manual effort.
- Organize assignments and tasks across semesters effectively.
- Understand how current performance will affect future grades.

The administrator lacks a centralized system to:
- Manage subjects and courses per semester.
- Monitor individual student academic progress.
- Make data-driven academic decisions.

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

| # | Goal |
|---|------|
| G1 | Provide students with real-time visibility into attendance, grades, and tasks |
| G2 | Enable accurate SGPA/CGPA calculation using the university's grading formula |
| G3 | Help students stay organized with a smart task/assignment scheduler |
| G4 | Give the admin full control over university course and subject data |
| G5 | Enable the admin to monitor and manage all student academic records |

### 3.2 Success Metrics (KPIs)

| Metric | Target |
|--------|--------|
| Student Daily Active Users (DAU) | ≥ 60% of enrolled students within 3 months |
| SGPA/CGPA calculation accuracy | 100% match with official formula |
| Attendance tracking accuracy | 99%+ |
| CGPA prediction error margin | ≤ 0.1 grade points |
| Task completion rate increase | ≥ 20% over baseline |
| Admin task resolution time | ≤ 5 minutes per action |

---

## 4. Target Users

### 4.1 Student (User Role)
- University students enrolled in one or more semesters.
- Needs to track personal attendance, grades, tasks, and academic trajectory.
- Selects their course from available courses after first login.

### 4.2 Admin Role
- A single designated administrator account for the university.
- Manages courses, subjects, semesters, and student enrollments.
- Can also access their own personal task scheduler and dashboard.

> [!IMPORTANT]
> There is exactly **ONE admin account** in the system. This account is pre-configured and cannot be self-registered by anyone.

---

## 5. User Personas

### Persona 1 — Arjun (Student)
> *"I want to know if I'll pass this semester before it's too late."*

- 2nd year B.Tech student
- Forgets assignment deadlines
- Doesn't know how to calculate CGPA manually
- Wants a simple dashboard to stay on track

### Persona 2 — The Admin
> *"I need to see which students are at risk so I can intervene early."*

- Sole administrator of the university platform
- Manages all courses, all semesters, and all subjects
- Needs to add/remove subjects and courses easily
- Wants to monitor student performance at scale

---

## 6. Roles & Permissions

| Feature | Student | Admin |
|---------|---------|-------|
| Register & Login | ✅ | ✅ (pre-created) |
| Select course after login | ✅ | ❌ |
| View own attendance | ✅ | ✅ |
| Log own attendance | ✅ | ✅ |
| View own SGPA/CGPA | ✅ | ✅ |
| Enter own grades | ✅ | ✅ |
| CGPA Prediction (self) | ✅ | ✅ |
| Task & Assignment Scheduler | ✅ | ✅ |
| Add personal notes per subject | ✅ | ✅ |
| Add resource links per subject | ✅ | ✅ |
| Pin resources for all students | ❌ | ✅ |
| View other students' data | ❌ | ✅ |
| Edit any student's records | ❌ | ✅ |
| Enroll / remove students | ❌ | ✅ |
| Create/Delete subjects | ❌ | ✅ |
| Create/Delete courses | ❌ | ✅ |
| Manage semesters | ❌ | ✅ |
| View platform-wide analytics | ❌ | ✅ |

---

## 7. Grading System & Formulas

> [!IMPORTANT]
> This section defines the exact grading system and formulas the platform must implement. All calculations must conform to this specification.

### 7.1 Grade Scale (10-Point System)

| Letter Grade | Grade Points |
|---|---|
| O (Outstanding) | 10 |
| A+ | 9 |
| A | 8 |
| B+ | 7 |
| B | 6 |
| C | 5 |
| D | 4 |
| F (Fail) | 0 |

> **Note:** Subjects with **0 credit hours** (e.g., audit/non-credit subjects like Indian Constitution) are tracked for grade records but **do not contribute** to SGPA or CGPA calculations.

---

### 7.2 SGPA Formula

```
SGPA = Σ (Credit_i × GradePoint_i) / Σ Credit_i
```

**Where:**
- `Credit_i` = Credit hours of subject i
- `GradePoint_i` = Grade point mapped from the letter grade of subject i
- Summation is over all subjects in the semester **with credit > 0**

**Example (from grade card):**

| Subject | Credits | Grade | Grade Points | Weighted |
|---------|---------|-------|-------------|----------|
| Foundation of AI & ML | 3 | A | 8 | 24 |
| Computer Programming | 3 | A | 8 | 24 |
| Computer Programming Lab | 1 | A+ | 9 | 9 |
| Communication Skills | 2 | A | 8 | 16 |
| Communication Skills Lab | 1 | A | 8 | 8 |
| Culture Education – 1 | 2 | A | 8 | 16 |
| Indian Constitution | 0 | C | — | 0 (excluded) |
| Engineering Mathematics-I | 4 | A | 8 | 32 |
| Applied Physics | 3 | D | 4 | 12 |
| Applied Physics Lab | 1 | A | 8 | 8 |
| Entrepreneurship Development | 1 | D | 4 | 4 |
| **TOTAL** | **21** | | | **153** |

```
SGPA = 153 / 21 ≈ 8.45 ✅
```

---

### 7.3 CGPA Formula

```
CGPA = Σ (SGPA_s × TotalCredits_s) / Σ TotalCredits_s
```

**Where:**
- `SGPA_s` = SGPA of semester s
- `TotalCredits_s` = Total credit hours earned in semester s
- Summation is over all **completed semesters**

---

### 7.4 CGPA Prediction Formula

```
Predicted CGPA = [Σ (SGPA_s × Credits_s) + Σ (ExpectedSGPA_r × Credits_r)]
                 / [Σ Credits_s + Σ Credits_r]
```

**Where:**
- `s` = completed semesters
- `r` = remaining/future semesters (with user-inputted expected grades)

---

## 8. Features & Functional Requirements

---

### 8.1 🔐 Authentication & Account Management

**FR-AUTH-01:** Students shall be able to self-register using their name, email, and password.  
**FR-AUTH-02:** There shall be exactly one admin account, pre-created in the system with fixed credentials set during initial setup.  
**FR-AUTH-03:** Students cannot register as admin; the admin role is not selectable during registration.  
**FR-AUTH-04:** The system shall support login via email and password.  
**FR-AUTH-05:** Upon first login, students shall be prompted to select their enrolled course from a list of available courses.  
**FR-AUTH-06:** Role-based dashboards shall load automatically upon login.  
**FR-AUTH-07:** Session tokens shall expire after 24 hours of inactivity.  
**FR-AUTH-08:** Students shall be able to update their profile (name, profile picture, password).

---

### 8.2 🎓 Student Onboarding & Course Selection

**FR-ONBOARD-01:** After registration, students shall select their course (e.g., B.Tech CSE) and current semester from a dropdown.  
**FR-ONBOARD-02:** Once a course is selected and confirmed by the student, it shall be locked and can only be changed by the admin.  
**FR-ONBOARD-03:** The subjects for the selected course and semester shall automatically appear in the student's attendance and grades modules.  
**FR-ONBOARD-04:** The admin shall be able to view all enrolled students, their selected course, and semester.  
**FR-ONBOARD-05:** The admin shall be able to change a student's course or semester if required.

---

### 8.3 📅 Attendance Tracking

**FR-ATT-01:** Students shall be able to view attendance per subject, per semester.  
**FR-ATT-02:** The system shall display for each subject:
  - Total classes held
  - Classes attended
  - Attendance percentage (attended / total × 100)
  - Minimum additional classes needed to reach 75%
  - Maximum classes that can be missed while staying ≥ 75%

**FR-ATT-03:** Students shall manually log each class as Present or Absent for each subject.  
**FR-ATT-04:** A color-coded indicator shall visually represent attendance health:
  - 🟢 Green: ≥ 75% (Safe)
  - 🟡 Yellow: 65–74% (Warning)
  - 🔴 Red: < 65% (Critical)

**FR-ATT-05:** The system shall display an in-app alert when a student's attendance drops below 75% in any subject.  
**FR-ATT-06:** Admins shall be able to view and manually edit attendance records of any student.  
**FR-ATT-07:** The attendance threshold is fixed at **75%** across all subjects. It is not configurable.

---

### 8.4 📊 SGPA & CGPA Tracking

**FR-GRADE-01:** Students shall be able to enter grades per subject per semester using the letter-grade system (O, A+, A, B+, B, C, D, F).  
**FR-GRADE-02:** The system shall automatically calculate SGPA using the formula defined in Section 7.2.  
**FR-GRADE-03:** The system shall automatically calculate CGPA using the formula defined in Section 7.3 after at least one semester is completed.  
**FR-GRADE-04:** Subjects with 0 credit hours shall appear in the grade entry list but shall be excluded from SGPA/CGPA calculations.  
**FR-GRADE-05:** A semester-wise SGPA history chart shall be displayed on the student dashboard.  
**FR-GRADE-06:** CGPA shall update automatically whenever a new semester's grades are entered.  
**FR-GRADE-07:** Admins shall be able to view and edit grade records of any student.

---

### 8.5 🔮 CGPA Prediction

**FR-PRED-01:** Students shall be able to access a "CGPA Predictor" tool from their dashboard.  
**FR-PRED-02:** The predictor shall use all completed semester data as a base.  
**FR-PRED-03:** For remaining semesters, students shall input expected letter grades per subject.  
**FR-PRED-04:** The system shall calculate predicted CGPA using the formula defined in Section 7.4.  
**FR-PRED-05:** The system shall also calculate the **minimum SGPA required per remaining semester** to achieve a user-defined target CGPA.  
**FR-PRED-06:** Results shall be shown as:
  - A projected CGPA trajectory graph (completed + predicted semesters)
  - Best-case CGPA (all O grades in remaining semesters)
  - Worst-case CGPA (all D grades in remaining semesters)
  - Current-trend CGPA (current average maintained)

---

### 8.6 📝 Task & Assignment Scheduler

**FR-TASK-01:** Students and the Admin shall be able to create tasks with:
  - Title and description
  - Due date and time
  - Priority: High / Medium / Low
  - Category: Assignment / Exam / Project / Personal / Other
  - Subject association (optional)

**FR-TASK-02:** Tasks shall be viewable in:
  - **List View** (sorted by due date / priority)
  - **Calendar View** (monthly/weekly view with tasks on their due dates)
  - **Kanban Board** (columns: To Do / In Progress / Done)

**FR-TASK-03:** The system shall display in-app reminders 24 hours before a task is due.  
**FR-TASK-04:** Students shall be able to update task status: To Do → In Progress → Done.  
**FR-TASK-05:** Overdue tasks shall be visually highlighted with a red badge.  
**FR-TASK-06:** The admin shall be able to broadcast task announcements/notices to all students (e.g., upcoming exam schedule).

---

### 8.7 🎓 Course & Subject Management (Admin Only)

**FR-COURSE-01:** The admin shall be able to create a new Course with:
  - Course name (e.g., B.Tech Computer Science)
  - Course code (e.g., BTCS)
  - Total number of semesters
  - Department name

**FR-COURSE-02:** The admin shall be able to edit or permanently delete a course.  
**FR-COURSE-03:** The admin shall be able to create subjects under a specific course and semester with:
  - Subject name
  - Subject code (e.g., DMA001A)
  - Credit hours (can be 0 for non-credit/audit subjects)
  - Subject type: Theory / Lab / Elective / Audit

**FR-COURSE-04:** The admin shall be able to edit or delete subjects from any semester.  
**FR-COURSE-05:** When a subject is deleted, existing student records linked to that subject shall be archived (not permanently deleted) to preserve historical data.  
**FR-COURSE-06:** Students enrolled in a course shall automatically see any new subjects added to their semester.

---

### 8.8 👨‍💼 Admin — Student Monitoring

**FR-ADMIN-01:** The admin shall have access to a searchable student directory with filters for:
  - Course, semester, enrollment number, student name

**FR-ADMIN-02:** The admin shall be able to view a detailed academic profile of any student, including:
  - Personal details (name, email, course, semester)
  - Attendance summary per subject
  - SGPA per semester and current CGPA
  - List of tasks and their statuses

**FR-ADMIN-03:** The admin shall be able to flag/mark students who are academically at risk:
  - Attendance below 75% in any subject
  - CGPA below a threshold (e.g., below 5.0)

**FR-ADMIN-04:** A platform-wide analytics dashboard shall be visible to the admin showing:
  - Total students enrolled per course
  - Average CGPA by course and semester
  - Number of students with low attendance
  - Task completion rates across the platform

**FR-ADMIN-05:** The admin shall be able to manually promote a student to the next semester when a semester is completed.

---

### 8.9 📚 Resources & Notes

**FR-RES-01:** Each subject shall have a dedicated **Resources & Notes** section accessible from the subject detail view.  
**FR-RES-02:** Students shall be able to add **personal text notes** for any subject with:
  - Title
  - Content (rich text / plain text)
  - Tag (e.g., Lecture Notes, Summary, Formula Sheet, Revision)
  - Date created / last updated

**FR-RES-03:** Students shall be able to add **resource links** for any subject with:
  - Title / label (e.g., "YouTube - Fourier Transform Explained")
  - URL
  - Resource type: YouTube / Article / Google Drive / Other

**FR-RES-04:** Resources and notes added by a student are **private** — visible only to that student.  
**FR-RES-05:** The admin shall be able to add **pinned resources** to any subject that are visible to **all students** enrolled in that subject (e.g., official syllabus link, reference book link).  
**FR-RES-06:** Pinned admin resources shall appear at the top of the subject's resource section with a 📌 pin badge.  
**FR-RES-07:** Students shall be able to **search and filter** their notes by subject, tag, or keyword.  
**FR-RES-08:** Students shall be able to **edit or delete** their own notes and links at any time.  
**FR-RES-09:** The admin shall be able to **edit or remove** pinned resources from any subject.  
**FR-RES-10:** Notes and resources shall be organised **per subject, per semester** — students can switch between semesters to view relevant content.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Page load time < 2 seconds on a standard broadband connection |
| **Scalability** | Support up to 10,000 registered students |
| **Availability** | 99.5% uptime |
| **Security** | Role-based access control (RBAC); all passwords hashed (bcrypt/argon2); HTTPS enforced |
| **Data Privacy** | Student data is private and inaccessible by other students |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Mobile Responsiveness** | Fully functional on mobile browsers (iOS Safari / Android Chrome) |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 major versions) |
| **Input Validation** | All user inputs validated client-side and server-side |

---

## 10. Out of Scope (v1.0)

> The following features are explicitly **NOT** part of the initial release:

- Live attendance marking via biometrics, QR code, or geo-location
- Bulk import or export of data via CSV or Excel files
- Integration with university ERP or LMS systems
- Faculty / teacher role or management
- Fee management or financial tracking
- Native mobile app (iOS/Android)
- SMS notifications
- Multi-admin support
- Student self-enrollment into individual subjects (subjects auto-populate from course)

> These may be considered for **v2.0** based on user feedback.

---

## 11. User Stories

### Student User Stories

| ID | User Story | Priority |
|----|------------|----------|
| US-01 | As a student, I want to register and select my course so I can see my relevant subjects. | High |
| US-02 | As a student, I want to log my attendance daily so I can track if I'm above 75%. | High |
| US-03 | As a student, I want to see exactly how many classes I can still miss and stay safe. | High |
| US-04 | As a student, I want to enter my letter grades per subject so SGPA is auto-calculated. | High |
| US-05 | As a student, I want to see my CGPA and SGPA history in a graph across all semesters. | High |
| US-06 | As a student, I want to predict my future CGPA by entering expected grades. | High |
| US-07 | As a student, I want to know the minimum SGPA I need to reach my target CGPA. | Medium |
| US-08 | As a student, I want to add assignments and tasks with deadlines so I stay organized. | High |
| US-09 | As a student, I want to view my tasks on a calendar so I can plan my week. | Medium |
| US-10 | As a student, I want to receive alerts when my attendance drops below 75%. | High |
| US-11 | As a student, I want to save notes and links for each subject so I can revise easily. | High |
| US-12 | As a student, I want to see pinned resources from the admin for each subject. | Medium |
| US-13 | As a student, I want to search my notes by keyword or tag to find them quickly. | Medium |

### Admin User Stories

| ID | User Story | Priority |
|----|------------|----------|
| UA-01 | As the admin, I want to add a new university course with its semester structure. | High |
| UA-02 | As the admin, I want to create subjects (with codes, credits, type) for each semester. | High |
| UA-03 | As the admin, I want to delete or edit any subject or course at any time. | High |
| UA-04 | As the admin, I want to view all registered students and their selected courses. | High |
| UA-05 | As the admin, I want to view any student's full academic profile (attendance + grades + tasks). | High |
| UA-06 | As the admin, I want to see which students are at academic risk (low attendance or CGPA). | High |
| UA-07 | As the admin, I want to manually move a student to the next semester when needed. | Medium |
| UA-08 | As the admin, I want to manage my own tasks and schedule from the same dashboard. | Medium |
| UA-09 | As the admin, I want to see platform-wide analytics on attendance and CGPA trends. | Medium |
| UA-10 | As the admin, I want to pin important resource links to a subject for all students to see. | High |
| UA-11 | As the admin, I want to remove or edit any pinned resource from any subject. | Medium |

---

## 12. System Architecture (High-Level)

```
┌─────────────────────────────────────────────┐
│               Frontend (Web App)             │
│         React.js / Next.js + Tailwind        │
└────────────────────┬────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────┐
│              Backend (API Server)            │
│                Node.js / Express             │
├─────────────────────────────────────────────┤
│  Auth Service │ Grade Engine │ Predict Engine│
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│                  Database                    │
│         PostgreSQL (primary data)            │
│         Redis (sessions & caching)           │
└─────────────────────────────────────────────┘
```

---

## 13. Data Models (Key Entities)

```
User
├── id, name, email, password_hash
├── role: [student | admin]
├── course_id (null until selected)
├── current_semester
└── created_at

Course
├── id, name, code, department
└── total_semesters

Subject
├── id, name, code, course_id
├── semester_number
├── credit_hours (0 for audit subjects)
└── type: [theory | lab | elective | audit]

Attendance
├── id, student_id, subject_id
├── total_classes, attended_classes
└── semester_number

Grade
├── id, student_id, subject_id
├── letter_grade: [O | A+ | A | B+ | B | C | D | F]
├── grade_points (auto-derived from letter grade)
└── semester_number

Task
├── id, user_id, subject_id (optional)
├── title, description
├── due_date, due_time
├── priority: [high | medium | low]
├── category: [assignment | exam | project | personal | other]
└── status: [todo | in_progress | done]

ClassSchedule
├── id, student_id, subject_id, semester_number
└── day_of_week: [0..6]

AcademicEvent
├── id, title, description, date
├── type: [exam | deadline | holiday | other]
├── course_id (null = global, set = specific course)
└── semester_number (null = course-wide, set = specific semester)
```

---

## 14. Screen Inventory (Wireframe Descriptions)

| Screen | Role | Description |
|--------|------|-------------|
| **Register** | Student | Name, email, password form; no role selector |
| **Login** | Both | Email + password; admin uses pre-set credentials |
| **Course Selection** | Student | Dropdown list of all courses → confirm selection |
| **Student Dashboard** | Student | Cards: CGPA, Attendance summary, Pending tasks, Upcoming deadlines |
| **Attendance Page** | Student | Subject-wise table: total, attended, %, classes to skip/attend |
| **Grades Page** | Student | Semester tabs → subject rows with letter grade dropdown → SGPA auto-display |
| **CGPA Predictor** | Student | Input expected grades → graph of projected CGPA trajectory |
| **Task Scheduler** | Both | List / Calendar / Kanban toggle; add-task modal |
| **Weekly Timetable** | Student | Schedule setup screen where students pick class days per subject for current semester |
| **Admin Dashboard** | Admin | Analytics: students enrolled, avg CGPA, at-risk count, attendance trends |
| **Course Manager** | Admin | Course list → expand to see semesters → subjects with add/edit/delete |
| **Academic Calendar Hub** | Admin | Admin CRUD for university events (Exams, Holidays, Deadlines) with Course/Semester scoping |
| **Student Directory** | Admin | Searchable/filterable student table → click row to open profile |
| **Student Profile View** | Admin | Full profile: attendance, grades, CGPA, task list |

---

## 15. Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1 — Foundation** | Week 1–2 | Auth system, single admin account, DB schema, course selection flow |
| **Phase 2 — Core Academic** | Week 3–5 | Attendance module, Grades module, SGPA/CGPA calculation engine |
| **Phase 3 — Scheduler** | Week 6–7 | Task & Assignment Scheduler (List + Calendar + Kanban) |
| **Phase 4 — Prediction** | Week 8–9 | CGPA Predictor with trajectory graph |
| **Phase 5 — Admin Tools** | Week 10–11 | Course/Subject CRUD, Student monitoring, Analytics dashboard |
| **Phase 6 — Polish & QA** | Week 12 | UI polish, edge case testing, formula validation |
| **Launch (v1.0)** | Week 13 | Production deployment |

---

## 16. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SGPA/CGPA formula error | Low | Critical | Unit test against known grade card outputs |
| Students entering incorrect grades | High | Medium | Input validation; admin can correct records |
| Admin credential compromise | Low | Critical | Strong password policy; rate-limit login attempts |
| Students stuck on course selection | Medium | Medium | Allow admin to change course if student is locked |
| Low adoption by students | Medium | High | Simple UX + onboarding walkthrough |

---

## 17. Confirmed Decisions (Resolved)

| Question | Decision |
|----------|----------|
| Grading scale | 10-point scale with letter grades (O, A+, A, B+, B, C, D, F) |
| Minimum attendance | 75% — fixed, not configurable |
| Admin accounts | Exactly 1 admin account, pre-created by system |
| Student enrollment | Admin adds/manages students; students select course after login |
| File import/export | Not supported in v1.0 |
| Subject enrollment | Auto-populated based on course + semester selection; no manual subject picking |

---

## 18. Acceptance Criteria Summary

| Feature | Acceptance Criteria |
|---------|---------------------|
| Registration | Student registers, selects course, sees correct subjects |
| Attendance | Attendance % and class calculations match manual formula |
| SGPA | Matches official grade card output using confirmed formula |
| CGPA | Correct weighted average across all completed semesters |
| CGPA Predictor | Live projection updates as expected grades change |
| Task Scheduler | Tasks appear on correct dates; overdue tasks highlighted |
| Course Manager | Subjects added/deleted by admin reflect immediately for students |
| Admin Monitor | Admin views full student profile; student cannot access others' data |
| Weekly Timetable | Student schedule setup scopes strictly by current semester; unscheduled subjects fallback to all 7 days |
| Academic Calendar Hub | Events scope by `courseId` & `semesterNo` and render as read-only chips in student calendar without counting towards personal due tasks |
| Role Security | No cross-role data access confirmed via security testing |

---

*End of Document — Version 1.1*  
*Updated: Grading formula confirmed, attendance threshold fixed at 75%, single admin account, no file import/export, student course selection flow added.*
