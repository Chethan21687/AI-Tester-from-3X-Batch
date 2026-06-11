# Requirements Traceability Matrix (RTM)

**Product:** VWO — Digital Experience Optimization Platform
**Document ID:** VWO-RTM-001 · **Version:** 1.0 · **Date:** 2026-06-11
**Links:** [Test Plan](01_VWO_Test_Plan.md) · [Test Cases CSV](02_VWO_TestCases.csv) · [Automation Suite](automation/)

Maps PRD requirement → test case (RICEPOT) → automated script. Bi-directional: every FR is covered, every script traces to a requirement.

---

## 1. FR → Test Case → Script

| PRD Ref | Requirement | Test Cases | RICEPOT | Automated Script |
|---|---|---|---|---|
| FR1 | A/B, Split & Multivariate Testing | TC-008, TC-009, TC-010, TC-011 | E, E, T, T | `tests/test_experiment.py` |
| FR1 | Custom goals / scheduling | TC-012, TC-013 | E, P | manual (not yet automated) |
| FR2 | SmartStats Engine | TC-017, TC-018 | P, T | manual |
| FR3 | Visual & Code Editor | TC-014, TC-015, TC-016 | O, O, O | TC-016 → `tests/test_experiment.py::test_preview_across_viewports` |
| FR4 | Heatmaps & Session Recordings | TC-019, TC-020, TC-021, TC-022 | E, E, E, O | manual |
| FR5 | Audience Targeting | TC-023, TC-024 | I, I | manual |
| FR6 | Real-time Reporting & Dashboards | TC-025, TC-026 | P, O | manual |
| FR7 | Personalization Engine | TC-027 | I | manual |
| FR8 | Integration Connectors | TC-028, TC-029, TC-030 | I, I, C | manual (sandbox) |
| FR9 | Collaboration & Workflow | TC-031 | O | `tests/test_workflow.py` |
| NFR-Security | Auth / 2FA / RBAC / Session | TC-001..007 | R,O,T,T,C,C,C | `tests/test_authentication.py` |
| NFR-Accessibility | WCAG 2.1 AA | TC-032, TC-033, TC-034 | O | `tests/test_accessibility.py` |
| NFR-Regression | Critical-path smoke | TC-035 | R | `tests/test_regression.py::test_critical_path_smoke` |

---

## 2. Script → Test Case (reverse trace)

| Script | Test(s) | TC IDs | Auth |
|---|---|---|---|
| `test_authentication.py` | login valid/invalid/empty/email-format, RBAC | TC-001,002,003,004,007 | mixed |
| `test_experiment.py` | A/B, Split, MVT, zero-variation, viewport | TC-008,009,010,011,016 | required |
| `test_workflow.py` | Kanban backlog card | TC-031 | required |
| `test_accessibility.py` | login a11y, keyboard nav, editor ARIA | TC-032,033,034 | mixed |
| `test_regression.py` | smoke path + repo/coverage guards | TC-035 (+guards) | mixed |

---

## 3. Coverage Summary

| Metric | Value |
|---|---|
| Total requirements (FR1–FR9 + 3 NFR) | 12 |
| Requirements with ≥1 test case | 12 / 12 (100%) |
| Total test cases | 35 |
| Automation candidates | 14 |
| Automated scripts | 14 tests across 5 files |
| RICEPOT dimensions covered | R, I, C, E, P, O, T (7/7) |

---

## 4. Coverage Gaps / Backlog

Manual-only today; candidates for future automation:

| Area | TC | Reason deferred |
|---|---|---|
| SmartStats assertions | TC-017, TC-018 | Non-deterministic stats; needs seeded traffic harness |
| Heatmaps/Recordings | TC-019..022 | Requires recorded-session fixtures |
| Integrations | TC-028..030 | Needs live sandbox GA/Mixpanel/Segment keys |
| 2FA / session timeout | TC-005, TC-006 | Needs OTP provider + time control |

*End of RTM — VWO-RTM-001 v1.0*
