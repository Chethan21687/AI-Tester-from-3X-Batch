# Master Test Plan

**Product:** VWO — Digital Experience Optimization (DXO) Platform
**Product URL:** https://app.vwo.com/
**Document ID:** VWO-MTP-001
**Version:** 1.0
**Status:** Draft for Review
**Prepared By:** QA Lead — Test Engineering
**Date:** 2026-06-11
**Reference PRD:** VWO PRD (Pramod Dutta, 2026-01-07)

---

## Document Control

| Version | Date | Author | Change Summary |
|---|---|---|---|
| 1.0 | 2026-06-11 | QA Lead | Initial master test plan derived from VWO PRD |

### Approvals

| Role | Name | Signature | Date |
|---|---|---|---|
| QA Lead | | | |
| Engineering Manager | | | |
| Product Manager | | | |
| Release Manager | | | |

### Distribution List

Product Management · Engineering · QA · DevOps · Release Management · Security & Compliance

---

## 1. Introduction

### 1.1 Purpose
This Master Test Plan (MTP) defines the strategy, scope, approach, resources, and schedule for validating the VWO Digital Experience Optimization platform against the requirements set out in the VWO PRD. It is the controlling document for all test activities across functional, integration, system, security, regression, and accessibility testing.

### 1.2 Product Overview
VWO is an enterprise CRO/DXO platform enabling A/B, Split URL, and Multivariate testing, behavioral insights (heatmaps, session recordings, surveys, funnels), personalization, program/workflow management, and a broad integration ecosystem. The platform is consumed primarily through `https://app.vwo.com/` by CRO specialists, product managers, UX designers, marketers, and analysts.

### 1.3 Intended Audience
QA engineers, automation engineers, developers, product owners, release managers, and security/compliance reviewers.

### 1.4 References
- VWO PRD v2026-01-07 (functional requirements FR1–FR9, NFRs).
- IEEE 829 Test Documentation standard (structural reference).
- WCAG 2.1 AA (accessibility baseline).
- GDPR / CCPA (data-privacy compliance baseline).

---

## 2. Test Items

| Module | PRD Ref | In Scope |
|---|---|---|
| Experimentation & Testing (A/B, Split URL, Multivariate) | FR1, 4.1, 5.1 | Yes |
| SmartStats Engine (Bayesian results) | FR2, 4.1 | Yes |
| Visual & Code Editor | FR3, 4.1 | Yes |
| Behavioral Insights (heatmaps, recordings, surveys, funnels) | FR4, 4.2, 5.2 | Yes |
| Audience Targeting / Segmentation | FR5, 4.1, 4.3 | Yes |
| Real-time Reporting & Dashboards | FR6, 4.1 | Yes |
| Personalization Engine | FR7, 4.3 | Yes |
| Integration Connectors (GA, Mixpanel, Shopify, Salesforce, Segment…) | FR8, 4.5 | Yes |
| Collaboration & Workflow Management (Kanban/Plan) | FR9, 4.4 | Yes |
| Authentication, 2FA, RBAC, Activity Logs | NFR Security | Yes |

---

## 3. Features To Be Tested

Derived from PRD functional requirements and user flows:

1. **Experiment lifecycle** — create, configure variations, target audience, set goals, schedule, launch, monitor, conclude winner (5.1).
2. **SmartStats** — statistical validity, confidence/probability-to-beat-baseline reporting.
3. **Editors** — WYSIWYG visual editor and code editor parity; preview; cross-device/cross-browser QA.
4. **Insights** — heatmaps (click/scroll/focus), session recordings, on-page surveys, funnel drop-off analytics (5.2).
5. **Audience targeting** — segmentation by geography, behavior, demographics, attributes.
6. **Reporting/Dashboards** — real-time metric updates, export, drill-down.
7. **Personalization** — real-time tailored content delivery to segments.
8. **Integrations** — data sync with GA, Mixpanel, Shopify, Salesforce, Segment, Snowflake, CMS.
9. **Workflow management** — Kanban backlog, collaboration, planning.
10. **Security & access** — login, 2FA, RBAC, activity/audit logs.

---

## 4. Features Not To Be Tested

| Item | Rationale |
|---|---|
| Third-party platform internals (Shopify, Salesforce backends) | Owned by external vendors; only VWO-side connector behavior tested. |
| Billing/payment gateway processing | Out of PRD test scope; covered by finance systems. |
| Native mobile SDKs | Listed as future enhancement, not current release scope. |
| AI suggestion engine | Future enhancement (PRD §11), not yet released. |
| Underlying cloud infra capacity | DevOps/SRE responsibility; covered by NFR scalability monitoring, not functional QA. |

---

## 5. Test Approach / Strategy

### 5.1 Test Levels
- **Functional** — each FR validated against acceptance criteria.
- **Integration** — VWO modules + external connectors (GA/Mixpanel/CMS) data flow.
- **System / E2E** — full user flows (5.1, 5.2) across modules.
- **Security** — authentication, 2FA, RBAC, session, input validation, audit logging, data privacy.
- **Regression** — sanity + critical-path suite on every release candidate.
- **Accessibility** — WCAG 2.1 AA on primary editor and dashboard surfaces.

### 5.2 Test Design Technique — RICEPOT
All test cases are derived using the **RICEPOT** coverage framework:

| Letter | Dimension | Application to VWO |
|---|---|---|
| **R** | Regression | Re-verify stable flows after change (login, experiment create). |
| **I** | Integration | Connector + cross-module data sync (GA goals, Segment events). |
| **C** | Compliance | GDPR/CCPA consent, audit logs, RBAC, data residency. |
| **E** | End-to-End | Full experiment & insights flows across UI + reporting. |
| **P** | Performance | 2s editor response NFR, dashboard real-time refresh, high-volume load. |
| **O** | Operability / Usability | Editor usability, accessibility, error handling, onboarding. |
| **T** | Test-data / Boundary | Variation limits, empty/invalid input, large segments, edge configs. |

### 5.3 Entry Criteria
- PRD baselined; build deployed to staging; test data and accounts provisioned; smoke suite green.

### 5.4 Exit Criteria
- 100% of Must (FR1–4, FR6) requirements executed; ≥95% pass rate.
- No open Critical or High severity defects.
- All accessibility AA blockers resolved on primary surfaces.
- Regression suite green on final RC.

### 5.5 Suspension & Resumption
Suspend when smoke fails or >20% of executing cases blocked. Resume after blocker fix verified and smoke re-passes.

---

## 6. Test Environment

| Component | Detail |
|---|---|
| Application | `https://app.vwo.com/` (staging mirror for automation) |
| Browser | Chromium (automation baseline); cross-browser QA manual |
| Automation | Playwright + Python, pytest, HTML reporting |
| Test data | Dedicated test accounts per role (admin/editor/analyst) |
| Integrations | Sandbox GA/Mixpanel/Segment endpoints |
| CI | Headless Chromium runs on pipeline |

---

## 7. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| QA Lead | Plan ownership, scope, sign-off |
| Automation Engineer | Playwright script development & CI integration |
| Manual QA | Exploratory, accessibility, cross-browser QA |
| Dev Team | Defect fixes, testability hooks |
| Security Reviewer | RBAC, 2FA, audit, privacy validation |
| Release Manager | Go/No-Go on exit criteria |

---

## 8. Schedule (Indicative)

| Phase | Duration |
|---|---|
| Test planning & design | Sprint 1 |
| Test case authoring (RICEPOT) | Sprint 1–2 |
| Automation scripting | Sprint 2–3 |
| Execution & defect cycles | Sprint 3–4 |
| Regression & sign-off | Sprint 4 |

---

## 9. Deliverables

- Master Test Plan (this document).
- Test case repository (CSV / Excel, RICEPOT-tagged).
- Playwright automation suite (Python, Chromium, HTML reports).
- Test execution & defect reports.
- Traceability matrix (FR ↔ test case ↔ script).

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| External connector instability | Integration tests flaky | Use sandbox endpoints + retry/mocks |
| Statistical engine non-determinism | Hard to assert SmartStats | Assert ranges/thresholds, seeded data |
| Editor DOM volatility | Brittle locators | Role/label-based Playwright locators |
| Accessibility debt | AA failures late | Shift-left axe scans each sprint |
| Test data privacy (PII) | Compliance breach | Synthetic data only; mask PII in logs |

---

## 11. Traceability Summary

| PRD FR | Priority | Test Types Covering |
|---|---|---|
| FR1 A/B/Split/MVT | Must | Functional, E2E, Regression, Boundary |
| FR2 SmartStats | Must | Functional, Performance |
| FR3 Visual/Code Editor | Must | Functional, Usability, Accessibility |
| FR4 Heatmaps/Recordings | Must | Functional, Integration |
| FR5 Audience Targeting | High | Functional, Integration, Boundary |
| FR6 Reporting/Dashboards | Must | Functional, Performance, E2E |
| FR7 Personalization | High | Functional, Integration |
| FR8 Integration Connectors | High | Integration, Security |
| FR9 Collaboration/Workflow | Medium | Functional, Usability |
| NFR Security | — | Security, Compliance, Regression |

---

## 12. Approval & Sign-off

Testing proceeds to execution upon approval of this plan by QA Lead, Engineering Manager, and Product Manager (see Approvals table).

*End of Master Test Plan — VWO-MTP-001 v1.0*
