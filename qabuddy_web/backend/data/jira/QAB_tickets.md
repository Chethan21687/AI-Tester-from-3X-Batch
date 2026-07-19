# JIRA — Project QAB (QABuddy)

## QAB-1 — User Authentication (Epic)
Umbrella epic for all login, session, and account-security work.

## QAB-2 — Login Story (Story)
As a user I can log in with valid credentials and am redirected to the dashboard. Acceptance: invalid credentials show an inline error; account locks after 5 failed attempts.

## QAB-6 — Automate Login (Task)
Automate the QAB-2 login flow in both Selenium (Java/TestNG) and Playwright (Python/Pytest). Includes a reusable login fixture and negative cases.

## QAB-15 — Login 500 Error (Bug) — Priority P1
Symptom: intermittent HTTP 500 from POST /api/login under concurrent sessions. Root cause: auth service throws a NullPointerException when the session cache is cold and the coupon/session token is empty, so the request is not handled gracefully. Fix: null-guard the token path and return 401 instead of 500. Affects checkout and dashboard redirect. Linked test: TC login negative suite; flaky on Firefox CI.

## QAB-101 — Payment Failure (Production Defect) — Priority P1
Symptom: payment intermittently fails at checkout with a gateway timeout when a saved card is used. Covered by checkout/payment test cases (order completes with saved card, coupon field edge cases). Under RCA; quarantine flaky payment tests after 3 consecutive CI failures per QA policy.
