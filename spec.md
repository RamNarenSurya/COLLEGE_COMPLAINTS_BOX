# College Complaint Management System

## 1. Project Overview

Build a production-ready **College Complaint Management System** that allows students to digitally report problems within their college and track the progress of those complaints until resolution.

The system replaces the traditional manual complaint process with a centralized web-based platform connecting:

**Student → Complaint → Admin Review → Department/Staff Assignment → Resolution → Student Feedback**

Students can report issues related to:

* Classrooms
* Laboratories
* Hostels
* Wi-Fi / Internet
* Infrastructure
* Transportation
* Cleanliness
* Electrical issues
* Water supply
* Campus facilities
* Other college-related problems

The application must provide authentication, complaint submission, complaint tracking, admin management, department/staff assignment, status updates, comments, priority management, resolution details, search/filtering, and basic statistics.

---

# 2. Project Goals

The main goals are:

1. Digitize the college complaint process.
2. Allow students to easily submit complaints.
3. Allow students to track complaint progress.
4. Allow administrators to manage complaints centrally.
5. Assign complaints to appropriate departments or staff.
6. Maintain a complete complaint history.
7. Provide transparency through complaint statuses.
8. Store all complaint data securely in a database.
9. Provide basic complaint statistics.
10. Build a responsive and deployable web application.

---

# 3. User Roles

The system has two primary roles.

## 3.1 Student

Students can:

* Register an account.
* Login/logout.
* View their dashboard.
* Submit complaints.
* Upload images/files.
* Select complaint categories.
* Enter issue location.
* Set complaint description.
* View submitted complaints.
* Track complaint status.
* View complaint history.
* View complaint details.
* View admin comments/updates.
* View resolution details.
* Close resolved complaints.
* Submit feedback after resolution.

Students must only be able to access their own complaints.

---

## 3.2 Admin

Administrators can:

* Login securely.
* View admin dashboard.
* View all complaints.
* Search complaints.
* Filter complaints.
* View complaint details.
* Review complaints.
* Assign complaints to departments.
* Assign complaints to staff.
* Change complaint priority.
* Change complaint status.
* Add comments/updates.
* Add resolution details.
* View complaint history.
* View basic statistics.
* Manage departments.
* Manage staff.
* Monitor unresolved complaints.

Admins can access all complaints.

---

# 4. Authentication

## 4.1 Student Registration

Students should be able to register using:

* Full Name
* Student ID
* College Email
* Password
* Department
* Year
* Phone Number

Example:

```text
Name: Rahul Kumar
Student ID: STU2026001
Email: rahul@college.edu
Department: Computer Science
Year: 3
Phone: 9876543210
Password: ********
```

Validation:

* Name is required.
* Student ID is required and unique.
* Email is required and unique.
* Valid email format.
* Password must satisfy minimum security requirements.
* Department is required.
* Year is required.

---

## 4.2 Student Login

Students login using:

```text
Email
Password
```

After successful authentication:

```text
Student → Student Dashboard
```

---

## 4.3 Admin Login

Admins should have a separate admin authentication flow.

Example:

```text
Admin Email
Password
```

After successful authentication:

```text
Admin → Admin Dashboard
```

Admin accounts should not be created through normal student registration.

---

## 4.4 Authentication Security

The system should use:

* Password hashing.
* Secure authentication tokens/session handling.
* Protected routes.
* Role-based authorization.
* Logout functionality.
* Server-side authorization checks.

Students must not be able to access admin APIs by manually modifying frontend requests.

---

# 5. Student Dashboard

The student dashboard should provide a quick overview.

## Dashboard Sections

### Welcome Section

Display:

```text
Welcome, Rahul
```

### Complaint Statistics

Display cards such as:

```text
Total Complaints
Submitted
In Progress
Resolved
Closed
```

Example:

```text
Total        12
Submitted     2
In Progress   4
Resolved      3
Closed        3
```

### Recent Complaints

Display recently submitted complaints.

Columns:

```text
Complaint ID
Title
Category
Priority
Status
Created Date
Action
```

---

# 6. Complaint Submission

Students must be able to submit a new complaint.

## Complaint Form

Required fields:

### Complaint Title

Short summary of the problem.

Example:

```text
Wi-Fi not working in Block A
```

### Category

Available categories:

```text
Classroom
Laboratory
Hostel
Wi-Fi / Internet
Infrastructure
Transportation
Cleanliness
Electrical
Water Supply
Library
Canteen
Security
Other
```

### Description

Detailed explanation of the issue.

Example:

```text
The Wi-Fi connection has not been working in Block A
since yesterday. Students are unable to access online
learning resources.
```

### Location

Example:

```text
Block A - 2nd Floor
```

### Priority

Students may optionally select:

```text
Low
Medium
High
Critical
```

The system may default new complaints to:

```text
Medium
```

Admins can change priority later.

### Attachment

Students can upload supporting files.

Supported examples:

```text
JPG
JPEG
PNG
PDF
```

File size should be restricted.

---

# 7. Complaint ID

Every complaint must receive a unique complaint ID.

Example:

```text
CMP-2026-0001
CMP-2026-0002
CMP-2026-0003
```

The complaint ID should be generated automatically.

Students should be able to use the ID to identify their complaint.

---

# 8. Complaint Status

The system must support the following status flow:

```text
Submitted
    ↓
Under Review
    ↓
Assigned
    ↓
In Progress
    ↓
Resolved
    ↓
Closed
```

## Status Definitions

### Submitted

Complaint has been successfully submitted by the student.

### Under Review

Admin has reviewed the complaint.

### Assigned

Complaint has been assigned to a department or staff member.

### In Progress

Department/staff has started working on the issue.

### Resolved

The reported issue has been fixed.

### Closed

The student has confirmed/accepted the resolution or the complaint has been formally closed by the administrator.

---

# 9. Complaint Status Rules

The backend should control valid status transitions.

Recommended transitions:

```text
Submitted → Under Review

Under Review → Assigned

Assigned → In Progress

In Progress → Resolved

Resolved → Closed
```

Admins may be allowed to return a complaint to an earlier status when necessary.

Example:

```text
Resolved → In Progress
```

if the student reports that the issue has not actually been resolved.

Every status change should be recorded in complaint history.

---

# 10. Complaint Details Page

Students should have a detailed complaint page.

Example layout:

```text
Complaint #CMP-2026-0001

Title:
Wi-Fi not working in Block A

Category:
Wi-Fi / Internet

Location:
Block A - 2nd Floor

Priority:
High

Status:
In Progress

Submitted:
21 September 2026
```

### Description

Display the complete complaint description.

### Attachment

Display uploaded image/file.

### Assigned Department

Example:

```text
IT Department
```

### Assigned Staff

Example:

```text
Network Administrator
```

### Admin Updates

Display comments and updates.

### Resolution

Display resolution details when available.

---

# 11. Complaint Timeline

Every complaint should have a timeline.

Example:

```text
21 Sep
Complaint Submitted

21 Sep
Complaint Under Review

21 Sep
Assigned to IT Department

22 Sep
Network Administrator assigned

22 Sep
Work Started

23 Sep
Issue Resolved

24 Sep
Complaint Closed
```

Each timeline entry should contain:

* Status/action
* Date/time
* User/admin who performed the action
* Optional comment

---

# 12. Complaint History

Students should have a complaint history page.

Example:

| Complaint ID  | Title         | Category       | Priority | Status      | Date   |
| ------------- | ------------- | -------------- | -------- | ----------- | ------ |
| CMP-2026-0001 | Wi-Fi Issue   | Wi-Fi          | High     | In Progress | 21 Sep |
| CMP-2026-0002 | Broken Fan    | Classroom      | Medium   | Resolved    | 18 Sep |
| CMP-2026-0003 | Water Leakage | Infrastructure | Critical | Closed      | 15 Sep |

Students can click a complaint to open its details page.

---

# 13. Admin Dashboard

The admin dashboard should provide an overview of the entire complaint system.

## Statistics

Display:

```text
Total Complaints
Pending Complaints
Under Review
Assigned
In Progress
Resolved
Closed
Critical Complaints
```

Example:

```text
Total Complaints       250
Pending                32
In Progress            47
Resolved               91
Closed                 80
Critical                5
```

---

# 14. Admin Complaint Management

Admins should have a complaint management page.

Example table:

| ID      | Student | Category  | Department  | Priority | Status      | Date   | Action |
| ------- | ------- | --------- | ----------- | -------- | ----------- | ------ | ------ |
| CMP-001 | Rahul   | Wi-Fi     | IT          | High     | In Progress | 21 Sep | View   |
| CMP-002 | Priya   | Hostel    | Hostel      | Medium   | Assigned    | 20 Sep | View   |
| CMP-003 | Arjun   | Classroom | Maintenance | Low      | Resolved    | 19 Sep | View   |

---

# 15. Search

Admins should be able to search complaints.

Search should support:

* Complaint ID
* Complaint title
* Student name
* Student ID
* Category
* Location

Example:

```text
Search: CMP-2026-0001
```

---

# 16. Filters

Admins should be able to filter complaints by:

### Status

```text
All
Submitted
Under Review
Assigned
In Progress
Resolved
Closed
```

### Priority

```text
All
Low
Medium
High
Critical
```

### Category

```text
Classroom
Laboratory
Hostel
Wi-Fi
Infrastructure
Transportation
Cleanliness
...
```

### Department

```text
IT
Maintenance
Hostel
Transport
Administration
Security
...
```

### Date

Allow filtering by date range.

---

# 17. Department Management

Admins should be able to manage departments.

Example departments:

```text
IT Department
Maintenance Department
Hostel Department
Transport Department
Administration
Security
Electrical Department
Cleanliness Department
```

Admin should be able to:

* Add department.
* Edit department.
* Activate/deactivate department.
* View assigned complaints.

---

# 18. Staff Management

Admins should be able to manage responsible staff members.

Staff fields:

```text
Name
Email
Department
Phone
Role
Status
```

Example:

```text
Name: Ravi Kumar
Department: IT
Role: Network Administrator
Status: Active
```

Staff can be assigned to complaints.

---

# 19. Complaint Assignment

Admin should be able to assign a complaint to:

1. Department
2. Staff member

Example:

```text
Complaint:
Wi-Fi not working

Department:
IT Department

Staff:
Network Administrator

Status:
Assigned
```

The assignment should be recorded in complaint history.

---

# 20. Admin Comments and Updates

Admins should be able to add comments.

Example:

```text
We have forwarded this issue to the network maintenance team.
The issue will be investigated today.
```

Comments should contain:

```text
Comment
Admin Name
Date
Time
```

Students can view these updates.

---

# 21. Complaint Priority

The system must support:

```text
Low
Medium
High
Critical
```

Example:

### Low

Minor inconvenience.

### Medium

Normal issue requiring attention.

### High

Issue significantly affecting students.

### Critical

Urgent issue requiring immediate attention.

Admins can change priority after reviewing the complaint.

---

# 22. Resolution Details

When resolving a complaint, the admin should provide:

```text
Resolution Description
Resolved By
Resolved Date
Optional Resolution Attachment
```

Example:

```text
Resolution:
The damaged Wi-Fi access point was replaced and network
connectivity has been restored.
```

The resolution should be visible to the student.

---

# 23. Student Confirmation

When a complaint becomes:

```text
Resolved
```

the student should be able to:

```text
Accept Resolution
```

or

```text
Report Issue Still Exists
```

If accepted:

```text
Resolved → Closed
```

If the issue still exists:

```text
Resolved → In Progress
```

The action should be stored in complaint history.

---

# 24. Feedback

After a complaint is closed, students may provide feedback.

Feedback fields:

```text
Rating: 1–5
Comment
```

Example:

```text
Rating: 5

Comment:
The issue was resolved quickly.
```

Feedback should only be available after resolution/closure.

---

# 25. Database Design

Use a relational database.

Recommended database:

```text
PostgreSQL
```

The application should use proper relationships and constraints.

---

# 26. Users Table

Suggested fields:

```text
users
-----
id
name
student_id
email
password_hash
role
department_id
year
phone
created_at
updated_at
```

Role:

```text
student
admin
```

---

# 27. Departments Table

```text
departments
-----------
id
name
description
status
created_at
updated_at
```

---

# 28. Staff Table

```text
staff
-----
id
name
email
phone
department_id
role
status
created_at
updated_at
```

---

# 29. Complaints Table

```text
complaints
----------
id
complaint_number
student_id
title
category
description
location
priority
status
department_id
assigned_staff_id
created_at
updated_at
resolved_at
closed_at
```

---

# 30. Complaint Attachments Table

```text
complaint_attachments
---------------------
id
complaint_id
file_name
file_url
file_type
file_size
uploaded_at
```

---

# 31. Complaint Updates Table

```text
complaint_updates
-----------------
id
complaint_id
user_id
status
comment
created_at
```

This table stores the complaint timeline.

---

# 32. Resolution Table

```text
resolutions
-----------
id
complaint_id
resolved_by
description
attachment_url
resolved_at
```

---

# 33. Feedback Table

```text
feedback
--------
id
complaint_id
student_id
rating
comment
created_at
```

A complaint should normally have at most one final feedback record from the student.

---

# 34. Database Relationships

Relationships:

```text
User
  |
  | 1:N
  ↓
Complaints
  |
  ├── Department
  |
  ├── Staff
  |
  ├── Attachments
  |
  ├── Updates
  |
  ├── Resolution
  |
  └── Feedback
```

Department:

```text
Department
    |
    ├── Staff
    |
    └── Complaints
```

---

# 35. REST API

The backend should provide REST APIs.

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

# 36. Student APIs

### Create Complaint

```http
POST /api/complaints
```

### Get Student Complaints

```http
GET /api/complaints/my
```

### Get Complaint

```http
GET /api/complaints/:id
```

### Update/Close Complaint

```http
PATCH /api/complaints/:id
```

### Submit Feedback

```http
POST /api/complaints/:id/feedback
```

---

# 37. Admin APIs

### Get All Complaints

```http
GET /api/admin/complaints
```

### Get Complaint

```http
GET /api/admin/complaints/:id
```

### Update Status

```http
PATCH /api/admin/complaints/:id/status
```

### Assign Department

```http
PATCH /api/admin/complaints/:id/department
```

### Assign Staff

```http
PATCH /api/admin/complaints/:id/staff
```

### Update Priority

```http
PATCH /api/admin/complaints/:id/priority
```

### Add Comment

```http
POST /api/admin/complaints/:id/comments
```

### Add Resolution

```http
POST /api/admin/complaints/:id/resolution
```

---

# 38. Department APIs

```http
GET    /api/departments
POST   /api/departments
PATCH  /api/departments/:id
DELETE /api/departments/:id
```

---

# 39. Staff APIs

```http
GET    /api/staff
POST   /api/staff
PATCH  /api/staff/:id
DELETE /api/staff/:id
```

---

# 40. Statistics API

```http
GET /api/admin/statistics
```

Example response:

```json
{
  "total": 250,
  "submitted": 20,
  "underReview": 12,
  "assigned": 25,
  "inProgress": 47,
  "resolved": 91,
  "closed": 55,
  "critical": 5
}
```

---

# 41. Frontend Pages

## Public Pages

```text
/
 /login
 /register
```

## Student Pages

```text
/student/dashboard
/student/complaints
/student/complaints/new
/student/complaints/:id
/student/history
/student/profile
```

## Admin Pages

```text
/admin/dashboard
/admin/complaints
/admin/complaints/:id
/admin/departments
/admin/staff
/admin/statistics
/admin/profile
```

---

# 42. UI Design

The interface should be:

* Professional.
* Modern.
* Clean.
* Responsive.
* Easy to understand.
* Mobile-friendly.
* Accessible.

Recommended visual style:

```text
Primary: Deep Blue
Secondary: Slate
Background: Light Gray
Card / Container: White
Success: Emerald Green
Warning: Amber
Danger: Crimson Red
```

---

# 43. Future Enhancements & Roadmap

- ✉️ **Email Notifications**: Automatic email notification dispatch (via SMTP/SendGrid/Resend) alerting students when complaint status updates occur or resolutions are posted.
- 🔔 **Real-Time Status Notifications**: Live web socket status alerts notifying students instantly about ticket updates on their dashboard.
- 📱 **Push Notifications**: PWA / Browser push notification integration.
