# Test Strategy: SCRUM-8
**Ticket:** SCRUM-8 | **Epic:** SCRUM-7 (Patient Login)
**Summary:** Create a Patient Login with Valid and Invalid Login Credentials
**Priority:** Medium | **Status:** To Do | **Reporter:** Chethan Dileep
**Project:** My Software Team

---

## 1. User Story

> **As a** patient,
> **I want to** log in to the healthcare portal using my credentials,
> **So that** I can securely access my health records, appointments, prescriptions, and other healthcare services.

---

## 2. Scope

### In Scope
- Patient login page functional behaviour
- Valid credential authentication flow → redirect to Patient Dashboard
- Invalid credential error handling (wrong password, wrong email/username)
- Empty field validation
- UI error message display and content

### Out of Scope
- Patient registration / sign-up flow
- Password reset / forgot password
- MFA / two-factor authentication
- Admin or doctor login flows
- Session timeout and token refresh
- Third-party SSO (Google, Apple, etc.)

---

## 3. Test Objectives
1. Verify successful login redirects patient to Patient Dashboard
2. Verify invalid password shows correct error message
3. Verify invalid username/email shows correct error message
4. Verify empty fields prevent login and show validation messages
5. Verify error messages do NOT reveal which field is wrong (security: generic message)
6. Verify login page remains displayed on failed attempts

---

## 4. Test Approach

| Layer         | Tool / Method          |
|---------------|------------------------|
| UI (E2E)      | Playwright + pytest    |
| API           | REST API direct calls  |
| Security      | Manual + OWASP checks  |
| Exploratory   | Manual session         |

---

## 5. Test Types

### 5.1 Functional Testing
Core happy path and AC-mapped scenarios.

### 5.2 Negative Testing
Invalid inputs, wrong credentials, boundary values.

### 5.3 UI / UX Testing
Field labels, button state, error message placement, accessibility.

### 5.4 Security Testing
- SQL injection in username/password fields
- XSS in input fields
- Brute force — check if account lockout exists
- Error message does not reveal valid vs invalid username (enumeration attack)

### 5.5 Boundary Value Testing
- Max character length in username/email and password fields
- Whitespace-only input
- Special characters in credentials

---

## 6. Test Cases

### TC-01: Successful Login — Valid Credentials (AC1)
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-01 |
| **Type**     | Functional / Happy Path |
| **Priority** | P1 — Critical |
| **Precondition** | Patient has a registered account |
| **Steps** | 1. Navigate to Login page<br>2. Enter valid username/email<br>3. Enter valid password<br>4. Click Login button |
| **Expected** | Patient authenticated successfully; redirected to Patient Dashboard |

---

### TC-02: Invalid Password — Valid Username (AC2)
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-02 |
| **Type**     | Negative |
| **Priority** | P1 — Critical |
| **Precondition** | Patient is on Login page |
| **Steps** | 1. Enter valid username/email<br>2. Enter **invalid** password<br>3. Click Login button |
| **Expected** | Error: `"Invalid username/email or password"` displayed; patient remains on Login page |

---

### TC-03: Invalid Username/Email — Valid Password (AC3)
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-03 |
| **Type**     | Negative |
| **Priority** | P1 — Critical |
| **Precondition** | Patient is on Login page |
| **Steps** | 1. Enter **invalid** username/email<br>2. Enter valid password<br>3. Click Login button |
| **Expected** | Error: `"Invalid username/email or password"` displayed; patient remains on Login page |

---

### TC-04: Empty Fields — No Input (AC4)
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-04 |
| **Type**     | Negative / Validation |
| **Priority** | P1 — Critical |
| **Precondition** | Patient is on Login page |
| **Steps** | 1. Leave all fields empty<br>2. Click Login button |
| **Expected** | Validation messages shown for both missing fields; login prevented |

---

### TC-05: Empty Username — Password Filled
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-05 |
| **Type**     | Negative / Validation |
| **Priority** | P2 — High |
| **Steps** | 1. Leave username/email empty<br>2. Enter valid password<br>3. Click Login |
| **Expected** | Validation message on username field; login prevented |

---

### TC-06: Empty Password — Username Filled
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-06 |
| **Type**     | Negative / Validation |
| **Priority** | P2 — High |
| **Steps** | 1. Enter valid username/email<br>2. Leave password empty<br>3. Click Login |
| **Expected** | Validation message on password field; login prevented |

---

### TC-07: Both Fields Invalid
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-07 |
| **Type**     | Negative |
| **Priority** | P2 — High |
| **Steps** | 1. Enter invalid username/email<br>2. Enter invalid password<br>3. Click Login |
| **Expected** | Error: `"Invalid username/email or password"`; remains on Login page |

---

### TC-08: Error Message Does Not Enumerate Username (Security)
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-08 |
| **Type**     | Security |
| **Priority** | P1 — Critical |
| **Steps** | 1. Enter known-valid username + wrong password (TC-02)<br>2. Enter unknown username + any password (TC-03)<br>3. Compare error messages |
| **Expected** | Both show identical message: `"Invalid username/email or password"` — no difference |

---

### TC-09: SQL Injection in Username Field
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-09 |
| **Type**     | Security |
| **Priority** | P1 — Critical |
| **Steps** | Enter `' OR '1'='1` in username field; any value in password; click Login |
| **Expected** | Login fails; no SQL error exposed; generic error shown |

---

### TC-10: XSS in Username Field
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-10 |
| **Type**     | Security |
| **Priority** | P1 — Critical |
| **Steps** | Enter `<script>alert('xss')</script>` in username; click Login |
| **Expected** | Script not executed; input sanitized or rejected |

---

### TC-11: Whitespace-Only Credentials
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-11 |
| **Type**     | Boundary / Negative |
| **Priority** | P2 |
| **Steps** | Enter spaces only in username and/or password fields; click Login |
| **Expected** | Treated as empty; validation message shown or login fails with error |

---

### TC-12: Max Length Input
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-12 |
| **Type**     | Boundary |
| **Priority** | P3 |
| **Steps** | Enter 256+ character string in username and password fields; click Login |
| **Expected** | Field either truncates, rejects, or handles gracefully without crash |

---

### TC-13: Password Masking
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-13 |
| **Type**     | UI / Security |
| **Priority** | P2 |
| **Steps** | Type in password field |
| **Expected** | Password characters masked (shown as dots/asterisks) |

---

### TC-14: Case Sensitivity — Email
| Field        | Detail |
|--------------|--------|
| **ID**       | TC-14 |
| **Type**     | Functional |
| **Priority** | P2 |
| **Steps** | Login with `PATIENT@EMAIL.COM` vs `patient@email.com` |
| **Expected** | Both treated as same account (email case-insensitive) |

---

## 7. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Generic error message not implemented (leaks valid usernames) | Medium | High — security | TC-08 must pass before release |
| SQL injection not sanitized in healthcare portal | Low | Critical — HIPAA data breach | TC-09 mandatory |
| No account lockout on brute force | Medium | High | Exploratory test; raise if absent |
| Session persists after logout | Low | High | Flag for separate ticket |

---

## 8. Entry Criteria
- Login page deployed to test environment
- Test patient accounts created (at least 1 valid registered account)
- API accessible for test data setup

## 9. Exit Criteria
- All P1 test cases passed
- No open Critical/Blocker bugs
- Security TCs (TC-08, TC-09, TC-10) passed
- Test results documented

---

## 10. Test Data Required

| Data Item | Value |
|-----------|-------|
| Valid patient email | `testpatient@example.com` |
| Valid patient password | `ValidPass@123` |
| Invalid email | `notauser@fake.com` |
| Invalid password | `WrongPass@999` |
| SQL injection string | `' OR '1'='1` |
| XSS string | `<script>alert('xss')</script>` |

---

*Generated from Jira SCRUM-8 via BLAST Framework — 2026-06-06*
