# Rural Talent — System Architecture

## 1. Purpose

Rural Talent is a managed remote digital-operations platform connecting verified workers in smaller towns with companies that need structured, repeatable digital work.

The initial product is **not a generic job marketplace**. The MVP focuses on managed **data-entry and data-verification work**, where the platform controls task allocation, worker execution, submission, and quality assurance.

## 2. MVP Architecture

```text
                         ┌─────────────────────┐
                         │      Employer       │
                         │   React Web App     │
                         └──────────┬──────────┘
                                    │ HTTPS / REST
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js + Express │
                         │      API Server     │
                         └──────┬──────┬───────┘
                                │      │
                  SQL queries   │      │ Firebase SDK
                                │      │
                                ▼      ▼
                         ┌──────────┐ ┌───────────────┐
                         │  MySQL   │ │ Firebase Auth │
                         └──────────┘ └───────────────┘
                                │
                                │ metadata
                                ▼
                         ┌─────────────────┐
                         │ Firebase        │
                         │ Storage         │
                         │ CSV/XLSX/files  │
                         └─────────────────┘

                         ┌─────────────────────┐
                         │       Worker        │
                         │   React Web App     │
                         └──────────┬──────────┘
                                    │ HTTPS / REST
                                    ▼
                              Express API

                         ┌─────────────────────┐
                         │       Admin         │
                         │   React Web App     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                              Express API
```

## 3. Technology Decisions

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React | Already known; suitable for role-based dashboards |
| Backend | Node.js + Express | Existing skill set; REST APIs are sufficient |
| Database | MySQL | Strong relational model for tasks, assignments, workers, QA, payments |
| Authentication | Firebase Authentication | Avoid building authentication from scratch |
| File storage | Firebase Storage | Simple object storage for MVP |
| API style | REST | Familiar and adequate for the workflow |
| Version control | Git + GitHub | Existing workflow |
| Deployment | Cloud platform suitable for Node/React/MySQL | Choose based on budget after MVP |
| Background jobs | Not required initially | Add only when asynchronous processing becomes necessary |

No new framework should be introduced unless it solves a demonstrated problem.

## 4. Major Components

### 4.1 React Application

One React application can expose different interfaces according to authenticated role:

```text
/app
  /employer
  /worker
  /admin
```

The frontend should not directly access MySQL or internal storage credentials.

Responsibilities:

- Authentication UI
- Dashboard rendering
- Task creation
- File upload initiation
- Worker task execution
- Submission
- QA views
- Progress/status display

### 4.2 Express API

Suggested modules:

```text
src/
  controllers/
  routes/
  services/
  middleware/
  repositories/
  validators/
  utils/
  config/
```

Suggested route groups:

```text
/api/auth
/api/users
/api/workers
/api/employers
/api/tasks
/api/assignments
/api/submissions
/api/qa
/api/files
/api/payments
/api/admin
```

Business rules should live in services rather than directly inside route handlers.

### 4.3 MySQL

MySQL stores transactional and relational data:

- users
- worker profiles
- employer profiles
- tasks
- task records
- assignments
- submissions
- QA reviews
- payments
- audit events

Binary files are stored outside MySQL.

### 4.4 Firebase Authentication

Firebase Authentication handles identity.

The backend verifies the Firebase ID token and determines the application role from server-controlled data.

Never trust a role sent by the client.

### 4.5 Firebase Storage

Stores:

- employer source files
- worker submission files
- generated result files
- optional evidence/attachments

Database rows should contain metadata and references, not large binary content.

## 5. Domain Model

Core relationships:

```text
User
 ├── WorkerProfile
 └── EmployerProfile

Employer
 └── Task
      ├── TaskRecord
      ├── Assignment
      │     └── Worker
      ├── Submission
      │     └── QAReview
      └── Payment
```

A task is the unit of business work.

An assignment represents the portion of a task allocated to a worker.

A submission represents work returned by a worker.

A QA review records whether submitted work satisfies the task's acceptance criteria.

## 6. Task Lifecycle

Recommended state machine:

```text
DRAFT
  │
  ▼
READY
  │
  ▼
ASSIGNED
  │
  ▼
IN_PROGRESS
  │
  ▼
SUBMITTED
  │
  ▼
QA_REVIEW
  ├───────────────┐
  │ pass          │ fail
  ▼               ▼
APPROVED       REWORK_REQUIRED
  │               │
  │               └──────► IN_PROGRESS
  ▼
DELIVERED
  │
  ▼
COMPLETED
```

Exceptional states:

```text
CANCELLED
DISPUTED
```

State transitions must be validated on the server.

## 7. API Responsibilities

Example:

### Create task

`POST /api/tasks`

Input:

```json
{
  "title": "Product catalog cleanup",
  "description": "Standardize product records",
  "deadline": "2026-10-15",
  "budget": 4000
}
```

### Upload source file

`POST /api/tasks/:taskId/files`

The API verifies:

- authenticated employer
- ownership of task
- allowed file type
- file size
- task state

### Assign worker

`POST /api/tasks/:taskId/assignments`

Only authorized admin users can initially assign workers.

### Submit work

`POST /api/assignments/:assignmentId/submission`

The server verifies that the worker owns the assignment and that the assignment is in a submittable state.

## 8. Security

Minimum security requirements:

- HTTPS in production
- Firebase token verification
- server-side RBAC
- ownership checks
- input validation
- file type/size validation
- parameterized SQL queries
- secrets in environment variables
- no service credentials in frontend code
- audit logging for important actions
- rate limiting on sensitive endpoints
- controlled download URLs for private files

Roles:

```text
EMPLOYER
WORKER
ADMIN
```

Do not allow users to select or modify their role through an ordinary profile update endpoint.

## 9. File Handling

Recommended flow:

```text
Browser
  │
  ▼
Backend authorization
  │
  ▼
Storage upload
  │
  ▼
Storage path recorded in MySQL
```

File metadata:

```text
id
task_id
uploaded_by
storage_path
original_filename
mime_type
size_bytes
checksum
created_at
```

For CSV/XLSX processing, validate structure before accepting a task into the execution pipeline.

Do not trust filenames or MIME types alone.

## 10. Quality Assurance Architecture

MVP QA can be manual.

Later:

```text
Completed work
      │
      ▼
Random sample
      │
      ▼
QA review
      │
      ├── Pass
      └── Fail
```

Store:

- sample size
- correct records
- incorrect records
- error categories
- reviewer
- timestamp
- final quality score

Worker quality score should be derived from verified work, not simply employer ratings.

## 11. Auditability

Important events should be recorded:

```text
TASK_CREATED
TASK_UPDATED
FILE_UPLOADED
WORKER_ASSIGNED
ASSIGNMENT_STARTED
SUBMISSION_CREATED
QA_COMPLETED
REWORK_REQUESTED
TASK_APPROVED
PAYMENT_RECORDED
TASK_COMPLETED
```

Audit records should be append-oriented and not casually editable.

## 12. Scaling Path

MVP:

```text
React
  ↓
Express
  ↓
MySQL
  ↓
Firebase Storage
```

When needed:

```text
Express
 ├── API
 ├── Queue
 └── Worker processes
       ↓
    MySQL
```

Potential later additions:

- Redis for caching/queues
- background workers for large file processing
- object storage/CDN
- database indexes and read replicas
- observability/log aggregation

Do not add these before real load requires them.

## 13. Tricky Integration Points

### File processing

Large CSV/XLSX files can consume memory. Process large datasets as streams or chunks when necessary.

### Concurrent work

Two workers must not accidentally receive the same record.

Use database constraints and transactional assignment logic.

### Task state

Do not allow arbitrary status changes from the frontend. The backend owns the state machine.

### Payments

Keep payment records separate from task completion logic. A completed task does not automatically mean a payout has been successfully processed.

### Time zones

Store timestamps consistently, preferably UTC, and convert them for display.

## 14. Non-Goals for MVP

- AI worker matching
- automatic payroll
- native mobile app
- real-time chat
- complex recommendation engine
- blockchain credentials
- multi-country payments
- automated dispute arbitration
- advanced ML quality prediction

## 15. Architecture Principle

The MVP should optimize for **learning speed and operational correctness**, not infrastructure sophistication.

If manual administration is cheaper than building automation and does not prevent validation, keep it manual.
