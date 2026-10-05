# College Complaint Management System

A production-ready, full-stack web application designed for colleges and universities to digitally report, manage, assign, track, and resolve campus-wide complaints and facility issues.

---

## 📋 Table of Contents

- [1. Overview](#1-overview)
- [2. System Workflow](#2-system-workflow)
- [3. Key Features](#3-key-features)
- [4. Tech Stack](#4-tech-stack)
- [5. User Roles & Access](#5-user-roles--access)
- [6. Pre-Seeded Test Credentials](#6-pre-seeded-test-credentials)
- [7. Installation & Quick Start](#7-installation--quick-start)
- [8. Database Design & Schema](#8-database-design--schema)
- [9. REST API Reference](#9-rest-api-reference)
- [10. Project Structure](#10-project-structure)

---

## 1. Overview

The **College Complaint Management System** replaces traditional paper-based or verbal complaint submission with a centralized, transparent platform. Students can digitally report infrastructure, classroom, hostel, Wi-Fi, electrical, or cleanliness issues. Administrators can monitor complaints, route tickets to specific departments and staff, track progress timelines, and record resolution details. Students retain final control by confirming resolution or reopening tickets if problems persist.

---

## 2. System Workflow

```text
[ Student Submits Ticket ]
          │
          ▼
   Status: Submitted  ──► (Auto-generates Complaint ID: CMP-2026-0001)
          │
          ▼
   Status: Under Review (Admin verifies details & location)
          │
          ▼
   Status: Assigned     (Admin assigns Department & Staff Member)
          │
          ▼
   Status: In Progress  (Assigned staff/technician works on issue)
          │
          ▼
   Status: Resolved     (Admin/Staff submits resolution details)
          │
    ┌─────┴─────────────────────────────┐
    ▼                                   ▼
[ Student Accepts Resolution ]     [ Issue Still Exists ]
    │                                   │
    ▼                                   ▼
 Status: Closed                    Status: In Progress
    │
    ▼
[ Student Feedback & 1-5★ Rating ]
```

---

## 3. Key Features

### 🎓 Student Features
- **Account Registration & Authentication**: Register using Name, Student ID, Email, Department, Year, and Phone.
- **Interactive Dashboard**: Overview KPI cards (`Total`, `Submitted`, `In Progress`, `Resolved`, `Closed`) and recent tickets.
- **Complaint Submission**: Select from 13 categories (*Classroom, Laboratory, Hostel, Wi-Fi / Internet, Infrastructure, Transportation, Cleanliness, Electrical, Water Supply, Library, Canteen, Security, Other*), set location, priority, description, and upload photo/PDF attachments.
- **Auto ID Generation**: Standardized ticket IDs formatted as `CMP-YYYY-XXXX`.
- **Real-Time Ticket Tracking & Timeline**: Visual activity feed showing status updates, administrative notes, and assigned staff.
- **Student Resolution Confirmation**: Once marked `Resolved`, students can either **Accept Resolution** (closing ticket) or **Report Issue Still Exists** (reopening ticket to `In Progress`).
- **Feedback & Rating**: Rate completed service on a 1-5 star scale with optional comments.

### 🛡️ Admin Features
- **Admin Dashboard & Analytics**: System-wide statistics, resolution velocity, critical alert banners, and satisfaction metrics.
- **Master Ticket Management**: Instant search by Ticket ID, Title, Student Name, Roll ID, or Location.
- **Multi-Field Filtering**: Filter complaints by Status, Priority, Category, Department, and Date range.
- **Status Lifecycle Control**: Update ticket statuses with enforced state transitions and log comments.
- **Department & Staff Routing**: Assign tickets to specialized campus academic departments (*CSE, AI, AIML, DS, AIDS, ECE, EEE, Civil, Mechanical*) and operational departments (*IT, Maintenance, Hostel, Transport, Electrical, Cleanliness, Security, Administration*) and individual personnel.
- **Priority Override**: Escalate ticket urgency (`Low`, `Medium`, `High`, `Critical`).
- **Resolution Recording**: Submit formal resolution descriptions and technician details.
- **Department Management**: Complete CRUD interface to manage active campus departments and inspect ticket volume.
- **Staff Directory Management**: CRUD interface for staff profiles, roles, and active workload tracking.

---

## 4. Tech Stack

- **Backend**: Node.js, Express.js REST API, SQLite database (with foreign key enforcement), JWT Authentication, Password Hashing (`bcryptjs`), Multer (File Uploads).
- **Frontend**: React 18, Vite, React Router DOM v6, Lucide Icons, Modern Glassmorphism CSS Design System with Outfit & Plus Jakarta Sans typography.

---

## 5. User Roles & Access

| Role | Access Privileges |
| :--- | :--- |
| **Student** | Access personal complaints, create tickets, upload attachments, view progress timelines, confirm resolution, rate service. |
| **Admin** | Access all tickets system-wide, assign departments & staff, update status, record solutions, manage department/staff CRUD, view system analytics. |

---

## 6. Pre-Seeded Test Credentials

The system automatically initializes and seeds standard test accounts upon first startup:

### 🔑 Admin Account
- **Email**: 
- **Password**: 
- **Role**: `admin`

*Note: Student accounts can be created directly using the Registration page.*

---

## 7. Installation & Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup & Run Instructions

1. **Clone & Install Dependencies**:
   ```bash
   npm run setup
   ```
   *This installs root, backend (`server/`), and frontend (`client/`) dependencies.*

2. **Start Backend API Server**:
   ```bash
   npm run dev:server
   ```
   The backend API will start on **`http://localhost:5000`** and seed `complaints.db`.

3. **Start Frontend Client**:
   ```bash
   npm run dev:client
   ```
   Open **`http://localhost:3000`** in your browser.

4. **Build Production Bundle**:
   ```bash
   npm run build:client
   npm start
   ```

5. **Run Automated API Verification Suite**:
   ```bash
   cd server && npm run test-api
   ```

---

## 8. Database Design & Schema

The relational database (`complaints.db`) consists of 8 interconnected tables:

```text
                    ┌──────────────┐
                    │  users       │
                    └──────┬───────┘
                           │ 1:N
                           ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ departments  │◄───┤  complaints  ├───►│    staff     │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │ 1:N
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ complaint_   │    │ complaint_   │    │ resolutions  │
│ attachments  │    │ updates      │    ├──────────────┤
└──────────────┘    └──────────────┘    │ feedback     │
                                        └──────────────┘
```

### Table Definitions

1. **`users`**: Stores student and admin credentials (`id`, `name`, `student_id`, `email`, `password_hash`, `role`, `department_id`, `year`, `phone`).
2. **`departments`**: Campus departments (`id`, `name`, `description`, `status`).
3. **`staff`**: Staff roster (`id`, `name`, `email`, `phone`, `department_id`, `role`, `status`).
4. **`complaints`**: Core ticket table (`id`, `complaint_number`, `student_id`, `title`, `category`, `description`, `location`, `priority`, `status`, `department_id`, `assigned_staff_id`, `resolved_at`, `closed_at`).
5. **`complaint_attachments`**: Attachment files (`id`, `complaint_id`, `file_name`, `file_url`, `file_type`, `file_size`).
6. **`complaint_updates`**: Ticket timeline history (`id`, `complaint_id`, `user_id`, `user_name`, `user_role`, `status`, `comment`, `created_at`).
7. **`resolutions`**: Resolution summaries (`id`, `complaint_id`, `resolved_by`, `description`, `attachment_url`).
8. **`feedback`**: Student satisfaction reviews (`id`, `complaint_id`, `student_id`, `rating`, `comment`).

---

## 9. REST API Reference

### Authentication
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Login (Student / Admin)
- `GET  /api/auth/me` — Fetch current user profile
- `POST /api/auth/logout` — End session

### Student Complaints
- `POST  /api/complaints` — Submit complaint with optional file attachment
- `GET   /api/complaints/my` — Get logged-in student's complaints & KPI stats
- `GET   /api/complaints/:id` — Get detailed ticket view, timeline & resolution
- `PATCH /api/complaints/:id` — Student resolution confirmation (`accept` / `reopen`)
- `POST  /api/complaints/:id/feedback` — Submit 1-5 star service rating

### Admin Operations
- `GET   /api/admin/complaints` — Search & multi-filter all tickets
- `GET   /api/admin/complaints/:id` — Get admin complaint management view
- `PATCH /api/admin/complaints/:id/status` — Update ticket status
- `PATCH /api/admin/complaints/:id/department` — Assign campus department
- `PATCH /api/admin/complaints/:id/staff` — Assign staff member
- `PATCH /api/admin/complaints/:id/priority` — Change priority level
- `POST  /api/admin/complaints/:id/comments` — Add progress update
- `POST  /api/admin/complaints/:id/resolution` — Record formal resolution
- `GET   /api/admin/statistics` — Get aggregate metrics & distribution data

### Departments & Staff Management
- `GET/POST/PATCH/DELETE /api/departments` — Department CRUD
- `GET/POST/PATCH/DELETE /api/staff` — Staff roster CRUD

---

## 10. Project Structure

```text
COMPLANT BOX/
├── spec.md                   # Full Specification Sheet
├── package.json              # Root orchestration script
├── README.md                 # Complete documentation
│
├── server/                   # Backend Node.js / Express Application
│   ├── package.json
│   ├── server.js             # Main server entry point
│   ├── db.js                 # SQLite schema & seeding engine
│   ├── test-api.js           # Automated API verification test suite
│   ├── middleware/
│   │   └── auth.js           # JWT & RBAC authorization middleware
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── complaints.js     # Student complaint endpoints
│   │   ├── admin.js          # Admin management endpoints
│   │   ├── departments.js    # Department management endpoints
│   │   └── staff.js          # Staff management endpoints
│   └── uploads/              # Static file attachment storage
│
└── client/                   # Frontend React / Vite Single Page Application
    ├── package.json
    ├── vite.config.js        # Proxy configuration
    ├── index.html            # HTML & Google Fonts
    └── src/
        ├── main.jsx          # React app entry point
        ├── App.jsx           # App layout & routing
        ├── index.css         # Glassmorphism design system
        ├── context/
        │   └── AuthContext.jsx # Auth state management
        ├── services/
        │   └── api.js        # API fetch wrapper
        ├── components/       # Reusable UI Components
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── StatusBadge.jsx
        │   ├── PriorityBadge.jsx
        │   ├── Timeline.jsx
        │   └── StatCard.jsx
        └── pages/            # Application Views & Portals
            ├── Landing.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── StudentDashboard.jsx
            ├── StudentComplaints.jsx
            ├── NewComplaint.jsx
            ├── ComplaintDetail.jsx
            ├── StudentHistory.jsx
            ├── StudentProfile.jsx
            ├── AdminDashboard.jsx
            ├── AdminComplaints.jsx
            ├── AdminComplaintDetail.jsx
            ├── AdminDepartments.jsx
            ├── AdminStaff.jsx
            ├── AdminStatistics.jsx
            └── AdminProfile.jsx
```
