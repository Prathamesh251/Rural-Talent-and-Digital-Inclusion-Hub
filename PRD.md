# Product Requirements Document — Rural Talent

**Product:** Rural Talent & Digital Inclusion Hub  
**Document:** PRD  
**Version:** 1.0  
**Status:** MVP Definition

---

# 1. Product Summary

Rural Talent is a managed remote digital-operations platform that connects verified workers in smaller towns with companies that need structured, repeatable digital work.

The first product will focus on **data entry and data verification**.

The platform is intentionally different from a generic job board.

Instead of:

```text
Company posts job → worker applies
```

the MVP follows:

```text
Company submits work
        ↓
Platform allocates work
        ↓
Verified workers execute
        ↓
Platform performs QA
        ↓
Company receives output
```

The platform therefore sells **reliable completed work**, not merely access to workers.

---

# 2. Problem

Small companies often need repetitive digital operations such as:

- product catalog cleanup
- data verification
- structured data entry
- spreadsheet normalization
- record checking

Existing freelance/job marketplaces provide access to workers but leave the employer responsible for:

- finding workers
- evaluating workers
- allocating work
- monitoring progress
- checking quality
- resolving rework

For workers in smaller towns, the problem is different:

- access to legitimate remote work can be fragmented
- reputation is difficult to establish
- skills may not be easily verified
- reliable work opportunities may be inconsistent

Rural Talent attempts to solve both sides through a managed workflow.

---

# 3. Product Hypothesis

> Companies will pay for reliable completion of structured digital work when Rural Talent handles worker allocation and quality control.

The first experiment is not intended to prove that rural workers want jobs. That is already a weak and obvious hypothesis.

The important test is whether the platform can create a sustainable transaction between employers and workers.

---

# 4. Target Users

## 4.1 Initial Employer Persona

A small or medium business that regularly has structured data work but does not want to manage a large freelance workforce.

Example:

> E-commerce agency with thousands of product records requiring cleanup and verification.

Characteristics:

- recurring digital operations
- spreadsheet/CSV-based workflows
- limited internal operations staff
- willing to outsource repetitive work
- values predictable turnaround and quality

## 4.2 Initial Worker Persona

A person in a smaller town who has:

- basic computer skills
- laptop/desktop access
- reliable internet
- sufficient typing/data-entry ability
- availability for remote work
- ability to follow written instructions

The platform should not assume that every worker can complete every task.

---

# 5. Goals

## MVP Goals

1. Allow employers to submit structured work.
2. Allow admins to allocate work to verified workers.
3. Allow workers to execute assigned work.
4. Allow workers to submit completed work.
5. Allow admins to perform QA.
6. Track task progress.
7. Produce a final deliverable for the employer.
8. Measure worker quality.
9. Record basic payment information.
10. Test whether employers will pay and return.

---

# 6. Non-Goals

The MVP will not attempt to become:

- a general employment portal
- a LinkedIn competitor
- a full freelance marketplace
- a social network
- an AI hiring platform
- a native mobile app
- an automated payroll platform
- a multi-country payment platform
- a complete HR management system

---

# 7. MVP Scope

## Employer

### Required

- register/login
- employer profile
- create task
- save draft
- enter task instructions
- upload CSV/XLSX
- define deadline
- define budget
- submit task
- view task status
- view progress
- receive final result

### Not required

- employer-worker chat
- bidding
- public job posting
- advanced analytics

---

## Worker

### Required

- register/login
- worker profile
- verification/qualification status
- view assigned tasks
- view instructions
- execute assigned work
- save progress
- submit work
- view submission status
- view basic quality score

### Not required

- social profile
- public follower system
- worker bidding
- AI career assistant

---

## Admin

### Required

- view employers
- verify employers
- view workers
- verify workers
- view tasks
- assign workers
- monitor assignments
- review submissions
- perform QA
- request rework
- approve task
- record payment status
- view audit events

---

# 8. Core User Journey

## Employer

```text
Sign in
  ↓
Create Task
  ↓
Upload CSV/XLSX
  ↓
Enter instructions
  ↓
Review
  ↓
Submit
  ↓
Platform assigns workers
  ↓
Track progress
  ↓
QA
  ↓
Receive result
  ↓
Complete task
```

## Worker

```text
Sign in
  ↓
See assignment
  ↓
Read instructions
  ↓
Complete records
  ↓
Submit
  ↓
QA
  ↓
Rework if required
  ↓
Approved
```

---

# 9. Functional Requirements

## FR-01 Authentication

Users must authenticate before accessing protected features.

Acceptance criteria:

- unauthenticated users cannot access protected routes
- authenticated users can access only permitted role interfaces
- server verifies authentication tokens

---

## FR-02 Role-Based Access Control

Roles:

```text
EMPLOYER
WORKER
ADMIN
```

Acceptance criteria:

- employer cannot access admin endpoints
- worker cannot access employer task-management endpoints
- role changes cannot be performed through normal client profile updates
- authorization is enforced server-side

---

## FR-03 Employer Task Creation

Employer can create a task with:

- title
- description
- instructions
- deadline
- budget
- source file

Acceptance criteria:

- required fields are validated
- invalid files are rejected
- task can be saved as draft
- task cannot enter READY state without required information

---

## FR-04 File Upload

Supported initial formats:

- CSV
- XLSX

Acceptance criteria:

- file size is limited
- file type is validated
- upload is associated with the correct task
- storage path is recorded
- unauthorized users cannot retrieve private files

---

## FR-05 Worker Assignment

Admin can assign workers to tasks.

Acceptance criteria:

- only verified/eligible workers can be assigned
- assignment records the worker and task
- duplicate assignment is prevented where inappropriate
- assignment state is tracked

---

## FR-06 Work Execution

Workers can execute assigned records.

Acceptance criteria:

- worker can access only their assignments
- progress is saved
- completed records are tracked
- invalid values are rejected
- work can be submitted only when required fields are complete

---

## FR-07 Submission

Worker can submit completed work.

Acceptance criteria:

- assignment enters SUBMITTED state
- submission is timestamped
- worker cannot silently replace an already submitted version
- resubmission follows explicit rework rules

---

## FR-08 Quality Assurance

Admin can review a sample or full submission.

QA records:

- sample size
- correct records
- incorrect records
- error categories
- accuracy
- reviewer
- timestamp

Acceptance criteria:

- QA result is persisted
- failed work can be returned for rework
- worker quality history is updated

---

## FR-09 Task State Management

Supported states:

```text
DRAFT
READY
ASSIGNED
IN_PROGRESS
SUBMITTED
QA_REVIEW
REWORK_REQUIRED
APPROVED
DELIVERED
COMPLETED
CANCELLED
DISPUTED
```

The server must control valid transitions.

---

## FR-10 Progress Tracking

The platform should calculate:

```text
assigned records
completed records
submitted records
approved records
```

Employer and admin dashboards should display progress.

---

## FR-11 Payments

MVP payment handling is intentionally manual.

The system stores:

- agreed budget
- payment status
- payment date
- payment reference
- worker payout information/status where appropriate

No automated payment gateway is required for the first validation.

---

## FR-12 Audit Log

Record significant events such as:

- task creation
- task update
- assignment
- submission
- QA decision
- rework
- approval
- payment update

---

# 10. Non-Functional Requirements

## Security

- HTTPS in production
- token verification
- server-side RBAC
- ownership validation
- input validation
- parameterized SQL
- protected secrets
- controlled file access

## Performance

For MVP:

- normal dashboard requests should feel responsive
- large file processing should not block the API unnecessarily
- database queries should use appropriate indexes

## Reliability

- transactional operations for important state changes
- regular database backups
- clear error handling
- no silent data loss

## Maintainability

- modular Express structure
- service layer for business logic
- validation layer
- consistent API response format
- environment-specific configuration

---

# 11. Initial Database Entities

```text
users
worker_profiles
employer_profiles
tasks
task_files
task_records
assignments
submissions
qa_reviews
payments
audit_logs
```

Key relationships:

```text
users
  ├── worker_profiles
  └── employer_profiles

employer_profiles
  └── tasks

tasks
  ├── task_files
  ├── task_records
  └── assignments

assignments
  └── submissions

submissions
  └── qa_reviews
```

---

# 12. Suggested API Surface

```text
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id

POST   /api/tasks/:id/files

POST   /api/tasks/:id/assignments
GET    /api/assignments
GET    /api/assignments/:id

POST   /api/assignments/:id/start
POST   /api/assignments/:id/save
POST   /api/assignments/:id/submit

POST   /api/submissions/:id/qa
POST   /api/submissions/:id/rework

GET    /api/workers
GET    /api/workers/:id

GET    /api/employers
GET    /api/employers/:id

GET    /api/admin/dashboard
GET    /api/admin/audit-logs
```

Exact endpoint structure can change during implementation.

---

# 13. Success Metrics

The MVP should measure business outcomes, not only software activity.

## Marketplace

- number of verified workers
- number of active employers
- tasks submitted
- tasks completed

## Quality

- average QA accuracy
- rework rate
- rejection rate
- worker quality distribution

## Economics

- revenue per task
- worker payout
- QA/operations cost
- infrastructure cost
- gross margin
- cost per completed record

## Retention

Most important:

- percentage of employers who submit a second paid task

A repeat paid customer is a much stronger signal than registrations.

---

# 14. Business Risks

## Risk 1 — No employer demand

Mitigation:

Validate manually before substantial development.

## Risk 2 — Poor worker quality

Mitigation:

Qualification tasks, QA sampling, quality scores, rework.

## Risk 3 — Bad unit economics

Mitigation:

Track cost per completed unit from the first real task.

## Risk 4 — Fraud

Mitigation:

Identity verification, audit logs, QA, controlled payouts.

## Risk 5 — Marketplace liquidity

Mitigation:

Start with one employer segment and one task category.

## Risk 6 — Operational overhead

Mitigation:

Keep assignment and QA manual until the workflow is proven.

---

# 15. Edge Cases

The system should eventually handle:

- employer cancels a task
- worker becomes unavailable
- worker misses deadline
- submission fails QA
- partial completion
- duplicate records
- duplicate worker assignment
- corrupted upload
- oversized upload
- employer disputes quality
- worker disputes rejection
- payment delayed
- task deadline passes
- network failure during work
- browser refresh during editing
- concurrent edits
- accidental duplicate submission

MVP can handle some of these manually, but the data model should not make future handling impossible.

---

# 16. Scaling Considerations

The first architecture should remain a modular monolith.

Do not begin with microservices.

Potential future scaling path:

```text
React
   ↓
Load balancer
   ↓
Express API
   ├── MySQL
   ├── Object Storage
   └── Queue
          ↓
      Workers
```

Introduce queues when operations such as:

- large file parsing
- report generation
- notifications
- automated QA
- bulk task creation

become too expensive or slow for synchronous API requests.

---

# 17. Future Product Directions

After product-market validation:

### Worker reputation

```text
Tasks completed
Accuracy
Reliability
Skills
Languages
```

### Automated matching

Match based on:

```text
skill
availability
quality
language
task difficulty
past performance
```

### AI-assisted operations

- record classification
- duplicate detection
- validation
- QA assistance
- transcription draft generation

### Additional work categories

Only after data-entry operations prove viable:

- transcription
- catalog enrichment
- document processing
- customer operations
- multilingual data verification

---

# 18. MVP Acceptance Criteria

The MVP is considered technically complete when:

1. An employer can authenticate.
2. An employer can create a task.
3. An employer can upload a valid CSV/XLSX file.
4. An admin can see and assign the task.
5. A worker can see the assignment.
6. A worker can execute the assigned work.
7. A worker can submit the work.
8. An admin can perform QA.
9. Failed work can be returned for rework.
10. Approved work can be marked completed.
11. Employer can see progress and result status.
12. Important actions are audited.
13. Role boundaries are enforced server-side.
14. Files are stored securely.
15. The workflow can be completed using a real test task from start to finish.

---

# 19. MVP Out of Scope

Explicitly postpone:

- native mobile app
- automated payouts
- AI matching
- sophisticated recommendations
- chat
- social features
- public job marketplace
- blockchain
- microservices
- Kubernetes
- complex analytics
- multi-country support

---

# 20. Product Decision Rule

Before adding a feature, ask:

> Does this help us validate whether companies will repeatedly pay for reliable completed work?

If not, it probably does not belong in the MVP.

---

# 21. Core Product Thesis

Rural Talent should not compete primarily by saying:

> "We have rural workers."

It should eventually compete by proving:

> **"We can reliably convert distributed rural talent into measurable, high-quality digital output for businesses."**

That distinction should guide the product, architecture, operations, and future automation.
