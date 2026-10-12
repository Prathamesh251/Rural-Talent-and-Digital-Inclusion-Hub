# Rural Talent — Development Phases

## Strategy

The development plan is intentionally staged around **validation first, software second**.

The biggest risk is not technical feasibility. It is whether companies will pay for managed digital work performed by the target workforce.

---

# Phase 0 — Manual Validation

## Goal

Test the business hypothesis before investing heavily in software.

### Hypothesis

> Companies will pay Rural Talent to complete structured digital operations using a verified distributed workforce.

### Activities

Find:

- 3 potential employers
- 10 potential workers

Run the workflow manually using:

- Google Sheets
- email/WhatsApp where appropriate
- shared files
- manual assignment
- manual QA
- manual payment tracking

### Test one narrow task

Example:

> Product catalog data cleanup.

### Success criteria

Proceed to software MVP if:

- at least one company is willing to pay for a real batch
- workers can complete the work
- acceptable quality can be achieved
- unit economics are not obviously broken
- the workflow is repeatable

If companies refuse to pay, change the business model before writing more software.

---

# Phase 1 — Technical Foundation

## Goal

Create the smallest functioning product skeleton.

### Build

- React application
- Express API
- MySQL database
- Firebase Authentication
- Firebase Storage
- Git/GitHub repository
- environment configuration
- basic deployment setup

### Roles

- Employer
- Worker
- Admin

### Deliverable

A user can sign in and see a role-specific dashboard.

---

# Phase 2 — Employer Workflow

## Goal

Allow an employer to create a real task.

### Features

- employer profile
- create task
- save draft
- add instructions
- upload CSV/XLSX
- validate basic file structure
- specify deadline
- specify budget
- submit task

### Deliverable

```text
Employer
 → creates task
 → uploads data
 → task becomes READY
```

---

# Phase 3 — Worker Workflow

## Goal

Allow a worker to execute assigned work.

### Features

- worker profile
- qualification status
- assigned tasks
- task instructions
- assigned records
- work interface
- progress
- save
- submission

### Deliverable

```text
Admin assigns
      ↓
Worker works
      ↓
Worker submits
```

---

# Phase 4 — Admin Operations

## Goal

Allow the platform to operate the workflow safely.

### Features

- employer verification
- worker verification
- task management
- worker assignment
- progress monitoring
- submission review
- task state management

### Deliverable

The platform can operate an entire task manually but digitally.

---

# Phase 5 — Quality Assurance

## Goal

Prove that output quality can be measured.

### Features

- QA review
- sample-based verification
- error categories
- accuracy score
- rework
- worker quality history

### Example

```text
100 submitted records
20 QA records checked

19 correct
1 incorrect

Accuracy = 95%
```

### Deliverable

A company can receive a meaningful quality result.

---

# Phase 6 — MVP Validation

## Goal

Run real work through the software.

### Target

Aim for:

- 3–5 employers
- 10–30 workers
- multiple real task batches
- repeat work from at least one employer

### Metrics

Track:

```text
Task completion rate
QA accuracy
Average completion time
Worker retention
Employer repeat rate
Cost per completed record
Revenue per task
Gross margin
```

### MVP success signal

The strongest signal is:

> A company returns with another paid task without being heavily persuaded.

---

# Phase 7 — Operational Automation

Only after MVP validation.

### Candidate features

- automatic task splitting
- worker matching
- automated notifications
- worker availability
- automated reminders
- batch progress calculation
- automated QA sampling
- payout automation

Do not automate a workflow that has not yet been understood manually.

---

# Phase 8 — Scale

When workload justifies it:

### Infrastructure

- background job queue
- Redis
- worker processes
- object storage optimization
- monitoring
- structured logging
- database indexing
- backups
- rate limiting

### Product

- advanced worker reputation
- employer analytics
- dispute workflow
- SLA tracking
- bulk task creation

---

# Phase 9 — AI-Assisted Operations

AI should improve unit economics rather than exist as a feature for marketing.

Potential uses:

```text
CSV classification
        ↓
automatic validation
        ↓
AI-assisted correction
        ↓
human verification
        ↓
QA
```

For transcription:

```text
Audio
 ↓
Speech-to-text API
 ↓
Worker correction
 ↓
QA
 ↓
Final transcript
```

AI should assist workers and QA rather than eliminate the human verification layer when accuracy is commercially important.

---

# Recommended Solo-Developer Timeline

Assuming approximately 2–4 hours/day:

| Phase | Time |
|---|---:|
| Phase 0 | 3–7 days |
| Phase 1 | 2–3 days |
| Phase 2 | 3–5 days |
| Phase 3 | 4–6 days |
| Phase 4 | 3–5 days |
| Phase 5 | 3–5 days |
| Phase 6 | 1–3 weeks of real usage |

A realistic coded MVP is approximately **3–5 weeks part-time**, excluding business-development time.

---

# What Not To Do

Do not start with:

- AI matching
- mobile app
- automated payroll
- recommendation engine
- chat
- social profiles
- complex microservices
- Kubernetes
- Redis
- event-driven architecture
- multi-country payments

These are not MVP requirements.

---

# Decision Gates

At the end of each phase ask:

### Gate 1

Can a real employer create a task?

### Gate 2

Can a real worker complete it?

### Gate 3

Can the platform prove quality?

### Gate 4

Will the employer pay?

### Gate 5

Will the employer return?

If Gate 4 or Gate 5 fails, stop adding features and revisit the business model.
