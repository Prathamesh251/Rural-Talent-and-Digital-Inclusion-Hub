# Rural Talent — Product & UX Design

## 1. Design Goal

The interface should make a complex operational workflow feel simple:

```text
Employer → Create Work → Platform → Worker → QA → Delivery
```

The product is not designed like a traditional social job board.

The primary concept is **work execution**, not job browsing.

## 2. Design Principles

1. Simple language.
2. Clear task status.
3. Minimal decisions per screen.
4. Mobile-friendly worker experience, while supporting desktop/laptop workflows.
5. Strong visibility into progress.
6. Avoid unnecessary UI features in MVP.
7. Never hide important acceptance criteria.
8. Design for lower digital-literacy users without making the employer interface simplistic.

## 3. User Types

### Employer

Needs to:

- create work
- upload data
- specify instructions
- track progress
- review results
- receive final output

### Worker

Needs to:

- complete qualification
- see available assignments
- understand instructions
- perform work
- submit work
- understand quality/performance

### Admin

Needs to:

- verify users
- allocate work
- monitor progress
- perform/review QA
- handle exceptions
- record payments

## 4. Employer Information Architecture

```text
Employer
├── Dashboard
├── Tasks
│   ├── Active
│   ├── Drafts
│   └── Completed
├── Create Task
├── Task Details
├── Results
└── Profile
```

## 5. Employer Dashboard

Primary information:

```text
Active Tasks       4
Awaiting QA        2
Completed          17
Total Spent        ₹XX,XXX
```

Task table:

| Task | Progress | QA | Deadline | Status |
|---|---:|---:|---|---|
| Catalog cleanup | 72% | Pending | 12 Oct | In Progress |
| Data verification | 100% | Passed | 10 Oct | Completed |

Avoid vanity metrics in MVP.

## 6. Create Task Flow

### Step 1 — Basic details

- task title
- description
- deadline
- budget

### Step 2 — Instructions

Provide a large, clear instruction field.

Example:

```text
Correct spelling mistakes.
Standardize categories.
Do not modify SKU values.
Leave unavailable information blank.
```

### Step 3 — Upload

Accepted initially:

- CSV
- XLSX

Show:

- filename
- file size
- detected record count
- validation errors

### Step 4 — Review

Show a confirmation screen before publishing:

```text
Task
Product catalog cleanup

Records
2,000

Deadline
12 Oct 2026

Budget
₹4,000

[Save Draft] [Submit Task]
```

## 7. Worker Information Architecture

```text
Worker
├── Dashboard
├── My Assignments
├── Assignment Details
├── Work Interface
├── Submission History
├── Quality
└── Profile
```

## 8. Worker Dashboard

Keep it task-oriented:

```text
Good evening, Worker

Assigned
3 tasks

In Progress
1 task

Pending Submission
2 tasks

Quality Score
96%
```

Avoid a complicated feed.

## 9. Assignment Details

Show:

```text
Task title
Employer/company
Instructions
Deadline
Records assigned
Records completed
Expected output
Quality requirements
```

The worker should not have to search across multiple screens for critical instructions.

## 10. Work Interface

For data verification:

```text
┌────────────────────────────────────────────┐
│ Product Verification          37 / 100      │
├────────────────────────────────────────────┤
│ Product Name:     [___________]             │
│ Category:          [___________]             │
│ Price:             [___________]             │
│ SKU:               [___________]             │
│                                            │
│ [Save]                     [Next]           │
└────────────────────────────────────────────┘
```

Important:

- autosave where practical
- prevent accidental loss
- show progress
- validate fields
- make keyboard navigation possible on desktop

## 11. Admin Information Architecture

```text
Admin
├── Overview
├── Tasks
├── Workers
├── Employers
├── QA
├── Payments
└── Audit Logs
```

Admin is intentionally operational rather than visually elaborate.

## 12. Status Design

Use text plus visual status indicators.

Example:

```text
DRAFT
READY
ASSIGNED
IN PROGRESS
SUBMITTED
QA REVIEW
REWORK REQUIRED
APPROVED
COMPLETED
```

Do not communicate status through color alone.

## 13. Error Handling

Bad:

> Something went wrong.

Good:

> The file could not be processed because the `SKU` column is missing.

Give users:

- what happened
- why
- how to fix it

## 14. Empty States

Example:

```text
No assignments yet.

You will see assigned work here once the platform
allocates a task to you.
```

Avoid empty dashboards that look broken.

## 15. Responsive Strategy

Worker experience should work well on smaller screens, but data-heavy execution may require a laptop.

Therefore:

- responsive web UI
- large touch targets
- simple navigation
- desktop keyboard support
- do not promise that every task is phone-only

## 16. Accessibility

Minimum:

- semantic HTML
- keyboard navigation
- visible focus states
- labels for inputs
- sufficient contrast
- error messages associated with fields
- avoid color-only meaning

## 17. Design System

Keep the initial system small:

```text
Typography
Spacing scale
Buttons
Inputs
Cards
Tables
Badges
Modals
Alerts
Progress indicators
```

Do not spend weeks building a design system before validating the workflow.

## 18. Trust Signals

Employer:

- verified company status
- task requirements
- clear pricing/budget
- progress visibility
- QA report

Worker:

- verified profile
- completed tasks
- quality score
- skill verification

Trust should come from evidence, not decorative badges.

## 19. MVP UX Exclusions

Do not initially build:

- social feed
- worker-to-worker chat
- complex messaging
- bidding marketplace
- public follower system
- gamification
- AI chatbot
- native mobile application

## 20. Core UX Principle

Every screen should answer:

> **What do I need to do next?**

If the answer is unclear, the interface is too complicated.
