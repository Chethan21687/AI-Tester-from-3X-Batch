# Project Constitution (gemini.md)

## Data Schemas — Confirmed

### Input Schema (Jira Ticket — actual)
```json
{
  "ticket_id": "SCRUM-8",
  "type": "Story",
  "epic": "SCRUM-7",
  "summary": "Create a Patient login with Valid and Invalid login credentials",
  "priority": "Medium",
  "status": "To Do",
  "reporter": "Chethan Dileep",
  "acceptance_criteria": [
    "AC1: Valid credentials → redirect to Patient Dashboard",
    "AC2: Invalid password → error message + stay on Login page",
    "AC3: Invalid email/username → error message + stay on Login page",
    "AC4: Empty fields → validation messages + prevent login"
  ]
}
```

### Output Schema (Test Strategy — delivered)
```json
{
  "ticket_id": "SCRUM-8",
  "delivery_file": "BLAST_Framework/test_strategy_SCRUM-8.md",
  "test_strategy": {
    "scope": "Patient login page functional + security behaviour",
    "objectives": [
      "Verify valid login → Dashboard redirect",
      "Verify invalid credentials → generic error message",
      "Verify empty fields → validation",
      "Verify no username enumeration (security)",
      "Verify no SQL injection / XSS vulnerabilities"
    ],
    "test_types": ["Functional", "Negative", "Boundary", "Security", "UI/UX"],
    "test_cases_count": 14,
    "priority_breakdown": {
      "P1_Critical": ["TC-01", "TC-02", "TC-03", "TC-04", "TC-08", "TC-09", "TC-10"],
      "P2_High": ["TC-05", "TC-06", "TC-07", "TC-11", "TC-13", "TC-14"],
      "P3_Low": ["TC-12"]
    },
    "risks": [
      "Username enumeration via distinct error messages",
      "SQL injection in healthcare data portal",
      "No brute force lockout"
    ]
  }
}
```

## Behavioral Rules
- Error messages must be generic — never reveal which field is wrong
- Healthcare portal context — security TCs are P1, not optional
- Test data must include dedicated test accounts (never use real patient data)

## Architectural Invariants
- Schema confirmed before execution — DONE
- Blueprint approved — DONE
- Delivery: .md file in BLAST_Framework/ directory
