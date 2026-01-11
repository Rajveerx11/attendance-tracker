# Product Requirements Document (PRD)

## Product Name

**Attendance Tracker v1 (Stable Core Edition)**

---

## 1. Purpose & Scope

This document defines the **Version 1 (V1)** scope of a personal attendance tracking web application. The goal of V1 is to build a **stable, correct, and minimal system** that reliably tracks attendance per subject on a daily basis.

This PRD intentionally limits features to avoid complexity, reduce bugs, and establish a solid foundation for future iterations.

V1 prioritizes **correctness, simplicity, and trustworthiness** over visual sophistication or advanced analytics.

---

## 2. Problem Statement

College students are often required to maintain a minimum attendance percentage (typically 75%) per subject. Manual tracking is unreliable and error-prone, leading to unintentional violations and academic penalties.

Existing solutions fail due to:

* Over-complexity
* Poor visibility into real attendance data
* Inconsistent or incorrect calculations

The product aims to solve this by acting as a **single source of truth** for attendance records.

---

## 3. Target User

* Individual college student
* Attendance-sensitive academic environment
* Uses the application daily or near-daily

This version is designed strictly for **single-user usage**, even though authentication is implemented.

---

## 4. Product Principles (V1)

1. **Simplicity over completeness**
2. **Derived data only** (no stored aggregates)
3. **One source of truth** (attendance records)
4. **Deterministic behavior** (same input → same output)

---

## 5. Core Features

### 5.1 Authentication

**Purpose:** Associate attendance data with a specific user.

**Requirements:**

* Email and password login
* Persistent session across reloads
* Logout functionality

**Out of Scope:**

* User profiles
* Password recovery flows
* Social login

---

### 5.2 Subject Management

**Purpose:** Define the entities for which attendance is tracked.

**Features:**

* Add a new subject
* Delete an existing subject

**Subject Attributes:**

* `id`
* `user_id`
* `name`

**Constraints:**

* Required attendance percentage is fixed at **75%** (hardcoded)

**Out of Scope:**

* Editing subject names
* Semesters or academic periods
* Subject metadata (credits, instructors, etc.)

---

### 5.3 Attendance Recording (Core Feature)

**Purpose:** Record daily attendance per subject.

**Rules (Non-Negotiable):**

* One attendance record per subject per date
* Attendance records are immutable in V1
* Attendance records are the **only source of truth**

**Features:**

* Mark a subject as `present` or `absent` for the current date
* Prevent duplicate attendance entries for the same subject and date

**Attendance Record Attributes:**

* `id`
* `subject_id`
* `date` (ISO format)
* `status` (`present | absent`)

**Out of Scope:**

* Editing past attendance
* Bulk entry
* Auto-detection or imports

---

### 5.4 Attendance Calculation (Derived Logic)

**Purpose:** Provide accurate attendance metrics without data inconsistency.

**Derived Metrics (Computed at Runtime):**

* Total classes conducted
* Total classes attended
* Attendance percentage

**Status Rules:**

* **Safe:** Attendance ≥ 75%
* **Danger:** Attendance < 75%

**Constraints:**

* No totals or percentages may be stored in the database
* All calculations must derive exclusively from attendance records

---

### 5.5 Today Screen (Primary UI)

**Purpose:** Enable fast daily usage and visibility.

**Displays:**

* Current date
* List of all subjects
* For each subject:

  * Subject name
  * Attendance count (`attended / total`)
  * Attendance percentage
  * Status label (Safe / Danger)
  * Action buttons: `Present`, `Absent`

**Behavior:**

* Attendance buttons are disabled once attendance is marked for the day
* Refreshing the page preserves state

**Out of Scope:**

* Charts
* Tabs or dashboards
* Analytics summaries

---

### 5.6 Attendance History (Text-Based)

**Purpose:** Provide transparency and debuggability.

**Features:**

* View chronological list of attendance records per subject
* Each entry shows:

  * Date
  * Day of week
  * Status (Present / Absent)

**Out of Scope:**

* Filtering
* Charts or visual summaries

---

### 5.7 Task Management (Optional, Minimal)

**Purpose:** Simple reminder system without added complexity.

**Features:**

* Add a task
* Mark task as completed

**Task Attributes:**

* `id`
* `user_id`
* `title`
* `completed`

**Out of Scope:**

* Due dates
* Priorities
* Subject association

---

## 6. Non-Functional Requirements

### 6.1 Data Integrity

* Attendance uniqueness enforced at the database level
* No derived data persisted

### 6.2 Reliability

* Page reloads must not alter data
* UI state must always reflect backend state

### 6.3 Performance

* Application must handle daily usage with minimal latency
* Attendance calculations should be lightweight and deterministic

---

## 7. Explicit Non-Goals (V1)

The following are **explicitly excluded** from Version 1:

* Graphs or charts
* Weekly or monthly views
* Attendance simulations
* Notifications or reminders
* Editing historical attendance
* Advanced task features
* Multi-user collaboration

---

## 8. Success Criteria

Version 1 is considered successful if:

* Attendance percentages are always correct
* Duplicate attendance entries are impossible
* The user trusts the system enough to rely on it daily
* The codebase remains understandable and debuggable

---

## 9. Future Considerations (Post-V1)

Features to be evaluated only after V1 stability:

* Attendance visualizations
* Recovery and risk analysis
* Task deadlines and priorities
* Notifications
* Mobile-first optimizations

---

## 10. Summary

Attendance Tracker v1 is a deliberately constrained product focused on **correctness and stability**. By limiting scope and enforcing strict data rules, this version establishes a reliable foundation for future expansion without repeating previous complexity-related failures.
