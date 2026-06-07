# Test Plan: SCRUM-8 — Patient Login (Valid & Invalid Credentials)

## 1. Test Plan Identification

| Field | Value |
|---|---|
| Test Plan ID | TP-SCRUM-8-PATIENT-LOGIN |
| Related Ticket | [SCRUM-8](https://your-domain.atlassian.net/browse/SCRUM-8) — Create a Patient Login with Valid and Invalid Login Credentials |
| Epic | [SCRUM-7](https://your-domain.atlassian.net/browse/SCRUM-7) — Patient Login |
| Project | My Software Team (Healthcare Portal) |
| Priority | Medium |
| Status | To Do |
| Plan Author | QA Engineer (assigned to SCRUM-8) |
| Plan Version | 1.0 (Draft) |
| Related Documents | Test Strategy — SCRUM-8 (companion doc, approach/rationale); Test Cases — SCRUM-8 (companion doc, step-by-step); `CLAUDE.md` (repo architecture reference) |

### 1.1 Objective

Define the logistics, environment, scheduling, resourcing, deliverables, and entry/exit mechanics required to plan and execute functional verification of the Patient Login feature described in SCRUM-8, so the team can confirm AC1–AC4 are met before the story is marked Done and the epic SCRUM-7 can progress.

This document does **not** describe the testing approach/rationale (see companion Test Strategy doc) or individual step-by-step test procedures (see companion Test Cases doc). It answers: *what gets tested, in which environment, by whom, on what schedule, with what entry/exit gates, and what could go wrong.*

### 1.2 References

- Jira Epic SCRUM-7 — Patient Login
- Jira Story SCRUM-8 — Create a Patient Login with Valid and Invalid Login Credentials (acceptance criteria AC1–AC4, in this plan's source ticket)
- Repository `CLAUDE.md` — 8-layer Playwright E2E architecture and Healthcare API Framework conventions
- `Healthcare_API_Framework/configuration/environments.py` and `configuration/credentials.json` — environment + credential resolution used for test data setup/teardown

---

## 2. Features to Be Tested (In Scope)

Derived directly from the SCRUM-8 acceptance criteria and stated "In Scope":

| Ref | Feature / Behaviour | Source AC |
|---|---|---|
| F1 | Login page renders and accepts username/email + password input | AC1–AC4 (precondition) |
| F2 | Successful authentication with **valid** patient credentials redirects to the **Patient Dashboard** | AC1 |
| F3 | Authentication with **valid username/email + invalid password** displays a **generic** error message and the user remains on the login page (no redirect, no session created) | AC2 |
| F4 | Authentication with an **invalid/unknown username or email** displays the **identical generic error message** as AC2 — verifying no username-enumeration leakage (security requirement) | AC3 |
| F5 | Client-side / server-side **field-level validation** when required field(s) are submitted empty (username only, password only, both empty) — submission is blocked and inline validation messages are shown | AC4 |
| F6 | Login page functional behaviour generally: focus states, field clearing, repeated submit attempts, error message visibility/dismissal | In Scope statement |
| F7 | UI presentation of error/validation messages (text content, placement, accessibility/visibility) for AC2–AC4 | In Scope statement |

## 3. Features Not to Be Tested (Out of Scope)

Per the ticket's explicit "Out of Scope" list — these are **excluded from this test plan** and will be covered (if at all) by separate stories/epics:

- Registration / sign-up flows
- Password reset / forgot-password flows
- Multi-factor authentication (MFA)
- Admin or doctor/provider login flows (these belong to other roles in `credentials.json` — `admin`, `doctor` — and are out of scope for SCRUM-8, which is patient-only)
- Session timeout / token refresh behaviour
- Third-party SSO integrations
- Performance/load testing of the login endpoint beyond the documented SLA spot-check already covered under the Healthcare API Framework's `auth` suite (`response_time_sla["login"] = 2000ms`) — not duplicated here
- Visual/pixel-level UI regression testing (covered separately if a visual-regression suite exists)
- Cross-browser/cross-device matrix beyond the project default (`--browser chromium`) unless explicitly added to the schedule (see Risks, §9)

---

## 4. Test Environment & Setup Needs

### 4.1 Environment Selection

This project resolves its target environment via the `ENV` environment variable, consistent across both frameworks in this repo:

- **Playwright E2E framework** (`Playwright_8_layer_architecture/`): `ENV=staging pytest` selects local/staging/production via `environments.py` (Layer 1 — Config). Default execution for SCRUM-8 should target **staging**, matching the Healthcare API Framework's default.
- **Healthcare API Framework** (`Healthcare_API_Framework/`): `ENV` defaults to `staging`; resolves to one of `local | staging | production | sandbox` via `configuration/environments.py`. Base URLs:
  - local → `http://localhost:8080/api/v1`
  - staging → `https://staging-api.healthcare.example.com/api/v1`
  - production → `https://api.healthcare.example.com/api/v1`
  - sandbox → `https://sandbox-api.healthcare.example.com/api/v1`

**Primary execution environment for SCRUM-8: `staging`.** Production is explicitly excluded from this plan's execution scope (no destructive auth testing against production patient accounts). `sandbox` may be used as a fallback if staging is unstable (see Risks, §9).

### 4.2 Test Accounts / Credentials

- UI-level credentials for the Playwright suite are sourced from environment variables `ADMIN_EMAIL` / `ADMIN_PASSWORD` per `CLAUDE.md`. For SCRUM-8 (patient-focused), equivalent **patient-role** test credentials must be provisioned and made available the same way (e.g., `PATIENT_EMAIL` / `PATIENT_PASSWORD`, or via the existing `regular_user` fixture pattern in `conftest.py`).
- The Healthcare API Framework resolves role-based credentials from `configuration/credentials.json` (gitignored), which currently defines three roles relevant to this system: `admin`, `doctor`, `patient`. SCRUM-8 testing uses **`patient`** role credentials only (`username: patient@healthcare.example.com` pattern, role `patient`).
- **New setup need**: at minimum **two** dedicated patient test accounts must exist in the staging environment before execution begins:
  1. A **valid, active patient account** with known username/email + password (for AC1 positive path and AC2 "valid username, wrong password" path).
  2. Confirmation that a **non-existent username/email** (one guaranteed not to be registered) is available/safe to use for AC3, without triggering account-lockout or fraud-detection side effects that could pollute the environment.
- Per repo convention ("Never create users directly in test code" — `CLAUDE.md`), patient test accounts should be created/torn down via the API layer (`AuthAPI` / `AuthBusiness` + `regular_user`-style fixtures), **not** manually via the UI, to keep the environment reproducible and auditable.
- HIPAA note: per `CLAUDE.md`, the `AuditLogger` masks PHI (SSN, phone, email, DOB) and never logs `password`/tokens. Test credentials must never be hard-coded into committed test files, fixtures, or this plan's companion docs — only referenced via env vars / `credentials.json` (gitignored).

### 4.3 Tooling & Configuration

- **Browser/runner**: Playwright with `pytest`, default `--browser chromium` (per `pytest.ini`), screenshots on failure, video on failure, tracing on first retry.
- **Pre-authenticated bypass NOT applicable here**: the `authenticated_page`/`admin_page` fixtures (which inject a JWT into `localStorage` to skip the login UI) must be **avoided** for SCRUM-8 scope — this story is testing the login UI itself, so tests must drive the actual login form.
- **Reporting**: HTML report generated to `test-results/report.html` (Playwright suite) / `output/report.html` (API suite); execution logs to `logs/test_execution.log`; HIPAA audit trail to `logs/audit.log`.
- **Setup steps** (once per environment, owned by QA/DevOps):
  1. `pip install -r requirements.txt` and `playwright install chromium` in `Playwright_8_layer_architecture/`.
  2. Confirm `ENV=staging` resolves correctly and the staging Patient Dashboard URL is reachable (dependency — see Risks §9).
  3. Confirm patient test account(s) exist and are active in staging; confirm credentials are exposed via the agreed env-var / fixture mechanism (not committed to source).
  4. Confirm `credentials.json` (Healthcare API Framework side, if used for setup/teardown helper calls) is present locally and gitignored.

---

## 5. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| QA Lead / Test Designer | Owns the companion Test Strategy and Test Cases docs; reviews this plan for completeness; signs off on entry/exit criteria before execution starts |
| QA Engineer (Executor) | Sets up test data/accounts via API layer, executes test cases against staging, logs results, raises defects, performs retest after fixes |
| Automation Engineer | Implements/maintains the Playwright page objects, fixtures, and specs needed to automate the AC1–AC4 scenarios within the 8-layer architecture (Layers 5–8) |
| Developer (Feature Owner) | Implements the login page/feature per AC1–AC4; triages and fixes defects raised against this plan; confirms generic-error-message parity (AC2/AC3) at the implementation level |
| Product Owner / BA | Clarifies ambiguous AC interpretations (e.g., exact wording of the "generic error message", which fields are "required" for AC4); reviews and approves sign-off |
| DevOps / Environment Owner | Provisions and maintains the staging environment, Patient Dashboard availability, and test patient accounts; resolves environment-access blockers |

*(No fixed team roster exists for this project at planning time; the above are functional roles to be staffed from the available QA/Dev pool.)*

---

## 6. Schedule & Milestones

Relative phases (no fixed calendar dates — to be slotted into the sprint containing SCRUM-8):

| Phase | Milestone | Depends on |
|---|---|---|
| M1 — Test Design | Test Strategy + detailed Test Cases for AC1–AC4 drafted and reviewed | SCRUM-8 ACs finalized; this Test Plan approved |
| M2 — Environment Readiness | Staging environment confirmed reachable; Patient Dashboard deployed; patient test accounts provisioned and validated | DevOps provisioning; feature branch deployed to staging |
| M3 — Test Execution (Cycle 1) | All designed test cases for AC1–AC4 executed at least once; results logged; defects raised | M1 + M2 complete; entry criteria met (§7.1) |
| M4 — Bug-fix & Retest (Cycle 2+) | Defects triaged and fixed by Dev; affected test cases re-executed; regression spot-check on adjacent auth flows | M3 defect list delivered to Dev; fixes deployed to staging |
| M5 — Sign-off | Exit criteria met (§7.2); summary report produced; QA Lead and Product Owner approve closure of SCRUM-8 | M4 complete with no open blocker/critical defects |

Each bug-fix/retest cycle (M4) repeats until exit criteria are satisfied or the suspension criteria (§7.3) force a scope/schedule renegotiation.

---

## 7. Entry / Exit / Suspension & Resumption Criteria

### 7.1 Entry Criteria (must be true before execution — M3 — begins)

- SCRUM-8 acceptance criteria (AC1–AC4) are finalized and unchanged since test design.
- The login page build is deployed to the staging environment and is accessible at the documented URL.
- The Patient Dashboard (destination of the AC1 redirect) is deployed and reachable in staging — **hard dependency**, see Risks §9.
- At least one valid, active patient test account exists in staging with known credentials exposed via the agreed secure mechanism (env var / gitignored credentials file / fixture).
- Companion Test Strategy and Test Cases documents for SCRUM-8 are reviewed and approved.
- Test environment tooling is installed and verified (`pip install -r requirements.txt`, `playwright install chromium`, `ENV=staging` resolves).

### 7.2 Exit Criteria (must be true to declare SCRUM-8 testing complete)

- 100% of designed test cases mapped to AC1–AC4 have been executed at least once.
- AC1: Valid-credential login redirects to the Patient Dashboard — verified passing, including confirmation the dashboard actually loads (not just a URL change).
- AC2 and AC3: **Message-parity verified** — the error text, styling, and on-page placement shown for "valid username + wrong password" and "invalid/unknown username" are byte-for-byte identical (or otherwise confirmed indistinguishable to an end user), and no response-time or behavioural side-channel (e.g., timing difference, different HTTP status surfaced to the UI) reveals whether the username exists. This is the single most important exit gate for this story given the explicit anti-enumeration security requirement.
- AC4: All required-field-empty combinations (username empty, password empty, both empty) correctly block submission and display field-level validation messages.
- No **Blocker** or **Critical** severity defects remain open against AC1–AC4 scenarios.
- Any **Major/Minor** defects remaining open are documented, triaged, and explicitly accepted/deferred by the Product Owner.
- Test execution summary report and defect log are published and reviewed by the QA Lead.
- Companion Test Strategy/Test Cases traceability confirms every AC has at least one passing, automatable (or automated) test.

### 7.3 Suspension Criteria (execution pauses)

- The staging environment becomes unreachable, or the login page / Patient Dashboard is removed/broken by an unrelated deploy, blocking >50% of planned test cases.
- A Blocker-severity defect is found that prevents any further meaningful testing (e.g., login form does not submit at all, or the generic-error-message requirement is fundamentally unimplementable as specified and needs PO/Dev re-scoping).
- Test patient account(s) become unusable (locked, deleted, credentials rotated) with no fallback account available.

### 7.4 Resumption Criteria

- The blocking condition is resolved and confirmed (environment restored, defect fixed and deployed, test account replaced/unlocked).
- A brief smoke check (login page loads; one valid-credential login succeeds) passes before full re-execution resumes.
- Any test cases executed shortly before suspension that may have produced unreliable results are re-run.

---

## 8. Test Deliverables

| Deliverable | Owner | Notes |
|---|---|---|
| This Test Plan (SCRUM-8) | QA Lead | Logistics/scheduling baseline (this document) |
| Test Strategy — SCRUM-8 | QA Lead / Test Designer | Companion doc — approach & rationale (not duplicated here) |
| Detailed Test Cases — SCRUM-8 | QA Engineer / Automation Engineer | Companion doc — step-by-step procedures mapped to AC1–AC4 |
| Automated test specs (Playwright, Layer 8: `tests/e2e/...`) | Automation Engineer | Implements the AC1–AC4 scenarios per the 8-layer architecture; uses `regular_user`/equivalent patient fixtures, never hardcodes credentials |
| Test execution log / results matrix | QA Engineer | Pass/fail status per test case per cycle, mapped back to AC1–AC4 |
| HTML execution reports (`test-results/report.html`) | QA Engineer | Generated per `pytest.ini` defaults; archived per cycle |
| Defect log (Jira bugs linked to SCRUM-8) | QA Engineer | One entry per failure, with severity, repro steps, evidence (screenshot/video/trace on failure per `pytest.ini`) |
| Test summary / sign-off report | QA Lead | Final exit-criteria checklist + recommendation to close SCRUM-8 |

---

## 9. Risks & Contingencies

| # | Risk | Likelihood | Impact | Contingency |
|---|---|---|---|---|
| R1 | **Patient Dashboard not yet available/stable in staging** — AC1 cannot be fully verified (redirect target doesn't exist or isn't deployed) | Medium | High | Coordinate with Dev/DevOps to confirm Dashboard deployment before M3 start (entry criterion §7.1); if delayed, test the redirect URL/route assertion in isolation and flag Dashboard-content verification as a follow-up/blocked sub-task rather than failing the whole cycle |
| R2 | **Generic error message wording is not yet defined / changes mid-cycle**, risking false positives on the AC2/AC3 parity check | Medium | High | Get the exact approved error-message copy from PO/Dev before test design is finalized (M1); if it changes after M3 starts, re-run only the affected AC2/AC3 cases rather than the full suite |
| R3 | **Environment instability** (staging flaky/unreachable) delays M2/M3 | Medium | Medium | Use `sandbox` environment as a documented fallback (per `environments.py` config); escalate to DevOps with a defined SLA for restoration; suspension/resumption criteria (§7.3/7.4) govern the pause |
| R4 | **Test patient account unavailable or gets locked/rotated mid-cycle** (e.g., from repeated invalid-password attempts under AC2 testing triggering lockout policies) | Medium | Medium | Provision a spare patient account; ensure account creation/teardown goes through the API layer (`AuthBusiness`/fixtures) so accounts can be quickly recreated; coordinate with Dev on whether lockout thresholds should be temporarily relaxed in staging |
| R5 | **Schedule risk** — defects found in M3 require multiple fix/retest cycles (M4), compressing the time available before the sprint/epic deadline | Medium | Medium | Prioritize AC1–AC3 (core security/functional paths) for the first execution pass so defects surface early; timebox M4 cycles and escalate to PO if a 3rd cycle is needed |
| R6 | **Username-enumeration side channels beyond the UI message** (e.g., differing HTTP status codes, response-time differences between "user exists" vs "user doesn't exist") are out of the UI-test's visibility but could undermine AC3's intent | Low | High | Flag to the API-level test suite (`Healthcare_API_Framework`, `auth` marker) as a cross-cutting concern; note in the defect log even if it's technically outside this plan's UI-only scope, since it affects the same security requirement |
| R7 | **Credential handling/HIPAA exposure** — risk of test credentials being committed to source or logged in plaintext | Low | High | Enforce the existing convention: credentials only via env vars / gitignored `credentials.json`; rely on `AuditLogger`'s PHI-masking; code review of any new fixtures/specs checks for hardcoded secrets before merge |

---

## 10. Approvals / Sign-off

| Name / Role | Responsibility | Approval | Date |
|---|---|---|---|
| QA Lead | Approves this Test Plan and the exit-criteria checklist at sign-off | ☐ Pending | |
| Product Owner / BA | Approves AC interpretation, generic-error-message wording, and final sign-off | ☐ Pending | |
| Developer (Feature Owner) | Confirms defect fixes are deployed and ready for retest | ☐ Pending | |
| DevOps / Environment Owner | Confirms environment and Patient Dashboard readiness (entry criteria) | ☐ Pending | |

*Sign-off is granted only when all Exit Criteria (§7.2) are demonstrably met and recorded in the test summary report (§8).*
