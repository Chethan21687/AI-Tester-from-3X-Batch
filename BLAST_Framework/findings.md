# Findings

## Jira Ticket SCRUM-8 — Extracted Data

| Field | Value |
|-------|-------|
| ID | SCRUM-8 |
| Type | Story |
| Epic | SCRUM-7 (Patient Login) |
| Project | My Software Team (SCRUM) |
| Summary | Create a Patient login with Valid and Invalid login credentials |
| Priority | Medium |
| Status | To Do |
| Reporter | Chethan Dileep |
| Assignee | None |
| Created | 2026-06-06 |

## User Story
As a **patient**, I want to log in to the healthcare portal using my credentials,
So that I can securely access my health records, appointments, prescriptions, and other healthcare services.

## Acceptance Criteria (Source of Truth)
- **AC1:** Valid credentials → authenticate + redirect to Patient Dashboard
- **AC2:** Valid email + invalid password → error: "Invalid username/email or password"; stay on Login page
- **AC3:** Invalid email + valid password → error: "Invalid username/email or password"; stay on Login page
- **AC4:** Empty fields → validation messages shown; login prevented

## Key Constraints Discovered
- Error message must be generic (same for wrong email AND wrong password) — prevents username enumeration
- Healthcare portal — HIPAA context; security testing is critical
- No acceptance criteria for: lockout, MFA, SSO, session management (out of scope for this story)
