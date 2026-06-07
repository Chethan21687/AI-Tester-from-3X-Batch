# Test Strategy — SCRUM-8: Patient Login (Valid & Invalid Credentials)

**Epic:** SCRUM-7 (Patient Login) | **Priority:** Medium | **Project:** My Software Team
**Feature area:** Healthcare Portal — Patient-facing authentication

---

## 1. Overview / Objective

SCRUM-8 covers the patient-facing login experience for the healthcare portal — the single
gateway through which patients reach Protected Health Information (PHI): health records,
appointments, and prescriptions. The objective of this strategy is to define **how** we will
validate that:

- legitimate patients can authenticate and reach the Patient Dashboard (AC1),
- illegitimate or malformed authentication attempts are rejected safely and *uniformly*
  (AC2/AC3), and
- the form guides users correctly before any request reaches the backend (AC4).

Because this feature sits directly on top of PHI access, the strategy treats login not just
as a functional UI flow but as the **first and most security-sensitive control point** in the
application. Every approach decision below is driven by that reality: a defect here is not a
"login is annoying" bug, it is a potential HIPAA exposure (unauthorized PHI access or
disclosure of which accounts exist in the system).

## 2. Scope

**In scope** (restated from the ticket):
- Login page functional behaviour (rendering, navigation/redirect on success)
- Valid-credential authentication flow (AC1)
- Invalid-credential authentication flows — wrong password and unknown username/email
  (AC2, AC3)
- Empty-required-field validation (AC4)
- UI error-message display and content/consistency

**Out of scope** (not exercised by this strategy):
- Registration / sign-up
- Password reset / forgot-password
- Multi-factor authentication (MFA)
- Admin / doctor / provider login flows
- Session timeout / token refresh
- Third-party SSO

Anything in the "out of scope" list that is *touched incidentally* (e.g., a "Forgot password?"
link rendering on the login page) will be checked only for presence/no-crash, not for its own
behaviour — that belongs to its own ticket's strategy.

## 3. Test Levels & Types — and Why They Matter Here

| Level / Type | Why it matters for *this* feature |
|---|---|
| **Functional (positive)** | AC1 is the "happy path" that every patient session depends on. If this breaks, the portal is unusable — highest business impact, and the baseline against which negative behaviour is compared. |
| **Negative / error-handling** | AC2–AC4 are explicitly negative-path acceptance criteria. Login is the most-attacked surface of any system; how it *fails* matters as much as how it succeeds. We must prove the app degrades safely (generic message, form retained, no stack traces/PHI leakage). |
| **Security (incl. OWASP-aligned checks)** | This is a healthcare portal — login failures that leak information are HIPAA findings, not just UX issues. AC3 *is* a security requirement (anti-enumeration) written directly into the acceptance criteria. We will explicitly test for: username/account enumeration (AC2 vs AC3 message/behaviour parity, response-time parity), injection attempts (SQLi/script payloads in the username/password fields), credential exposure in network traffic, logs, browser storage, and autocomplete/caching of sensitive fields. This aligns with OWASP ASVS/Top-10 authentication guidance (V2: Authentication, broken-auth and sensitive-data-exposure categories). |
| **Boundary / input validation** | AC4 (empty fields) is a boundary case; we extend the same thinking to whitespace-only input, max-length input, and unicode/special-character input in username/password — common sources of validation bypass or ungraceful errors. |
| **UI / presentation** | Error messages, field-level validation cues, and redirect behaviour are all user-visible contract points defined in the ACs (AC2–AC4 explicitly describe *what the user sees*). UI-level checks confirm the contract is honoured, not just that the backend returned the right status. |
| **Exploratory** | Scripted cases (positive/negative/security) cover the *known* AC space. Time-boxed exploratory charters around the login page catch the *unknown* — e.g., browser back/forward after failed login, double-submit, copy-paste edge cases, locale/keyboard differences — which scripted suites systematically under-cover. |

Performance/load testing of the login endpoint and accessibility (a11y) auditing are
acknowledged as adjacent concerns but are **not** the focus of this strategy; they should be
tracked as separate efforts if required, so this strategy stays aligned to the ticket's
acceptance criteria.

## 4. Test Approach Per Layer

This repo already has two complementary structures we will lean on rather than invent new ones:

### 4.1 UI / E2E — `Playwright_8_layer_architecture/` (per CLAUDE.md)
The patient login UI flow (AC1, AC2, AC4, and the *display* half of AC3) is naturally an
end-to-end concern and belongs in the existing 8-layer architecture, following the layering
and conventions already documented in the repo's `CLAUDE.md`:

- **Layer 6 (Pages)** — A `LoginPage` (extending `BasePage`, implementing `goto()`) holds the
  username/email field, password field, submit button, and error/validation-message locators
  as instance attributes, exposing intention-revealing actions such as `login(username,
  password)` and assertion helpers like `expect_generic_error()` / `expect_field_error(field)`.
- **Layer 5 (Components)** — Any shared chrome (header/nav shown post-login on the Patient
  Dashboard) is composed via existing components (e.g., `HeaderComponent`) rather than
  re-implemented in the login spec.
- **Layer 4 (Fixtures)** — Per `conftest.py` conventions, the `regular_user` fixture
  provisions a real patient account via `AuthAPI` for the *valid-credential* scenario (AC1)
  and tears it down afterward — **never** create users directly in test code. Negative
  scenarios (AC2/AC3) deliberately do **not** use `authenticated_page`/`admin_page` (those
  bypass the login UI by injecting JWTs — the opposite of what we're testing here); they
  exercise the real login form with intentionally wrong credentials.
- **Layer 8 (Tests)** — Specs under `tests/e2e/auth/` (mirroring the existing
  `test_login.py` pattern) consume only fixtures and page objects, keeping assertions about
  *user-visible behaviour*: redirect to dashboard (AC1), generic error text and "stays on
  login page" (AC2/AC3), and field-level validation messages without a network round-trip
  (AC4).

### 4.2 API — `Healthcare_API_Framework/` patterns
Where the acceptance criteria describe backend-observable behaviour (e.g., "shows the SAME
generic error" implies the backend must also not differentiate response codes/payloads/timing
between "bad password" and "unknown user"), we reuse the patterns already proven in
`Healthcare_API_Framework`:
- `AuthService` / `AuthBusiness` for issuing login calls with valid, wrong-password, and
  unknown-username payloads, asserting status-code *and* response-shape parity between the
  AC2 and AC3 cases (this is where enumeration would actually be caught — at the API level,
  before it ever reaches the UI).
- `ResponseAssertions` / `SLAThresholds` for response-time parity checks (a measurable timing
  difference between "user not found" and "wrong password" is itself an enumeration vector).
- `AuditLogger` conventions — confirm that failed-login attempts are captured in the HIPAA
  audit trail (§164.312(b)) **with PHI/credentials masked**, matching the existing
  `_mask_phi` / `_MASKED_FIELDS` behaviour, and that no password or token value ever appears
  in logs, console output, or error responses.

### 4.3 Security / OWASP-aligned checks
Layered on top of (and partly overlapping with) 4.1/4.2, run as a dedicated pass:
- **Anti-enumeration (AC3 as a security control):** message text, HTTP status, response
  latency, and any client-side hints (field-level highlighting, autofocus) must be identical
  for "wrong password" vs "unknown username."
- **Injection probes:** SQL-injection and script/HTML-injection strings submitted through
  username/password fields must be safely rejected/escaped, never reflected unsanitized in
  the error message or dashboard.
- **Transport & storage:** credentials must travel only over HTTPS, must not be logged in
  plaintext, must not populate browser autocomplete/local storage in a way that persists PHI
  access, and the password field must be masked and non-cacheable.
- **Generic-error-message review:** confirm the AC2/AC3 message itself reveals nothing
  (no "user does not exist," no password-policy hints) — a copywriting detail with real
  security weight.

### 4.4 Exploratory testing
A short, time-boxed (session-based) exploratory charter focused specifically on the login
page: rapid alternating valid/invalid attempts, browser navigation (back/forward/refresh)
mid-flow, multiple tabs, paste-from-clipboard, IME/unicode input, and rate-limiting/lockout
behaviour observation (even though "lockout" itself isn't an AC, *how the system behaves under
repeated failed attempts* is directly relevant to AC2/AC3 and to HIPAA's access-control
expectations).

## 5. Tools & Frameworks

Consistent with what this repository already standardizes on (see root `CLAUDE.md` and
`Healthcare_API_Framework`):

- **Playwright + pytest** — UI/E2E execution, run from `Playwright_8_layer_architecture/`
  (`pytest`, `pytest --headed`, `pytest --headed --slowmo 500 ...` for debugging), with the
  existing `pytest.ini` defaults (chromium, screenshot/video/trace on failure, HTML report at
  `test-results/report.html`).
- **`Healthcare_API_Framework` service/business/utility layers** — `AuthService`,
  `AuthBusiness`, `ResponseAssertions`, `SLAThresholds`, `AuditLogger`, `OutputManager` —
  reused for the API-level and HIPAA-audit-trail aspects of this strategy rather than
  rebuilt from scratch.
- **`EnvironmentConfig` / `EnvironmentManager`** — environment- and role-aware credential
  resolution (`ENV=staging pytest`, `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars), so negative
  scenarios can safely use throwaway/synthetic patient credentials without hardcoding secrets.
- **pytest markers** (`@pytest.mark.auth`, `@pytest.mark.smoke`, etc.) to allow the suite to
  be sliced by risk tier (see §6) for fast feedback vs. full-regression runs.

## 6. Risk-Based Prioritization Rationale

| Priority | Scenario cluster | Why |
|---|---|---|
| **P1** | AC2/AC3 generic-error parity + security probes (enumeration, injection, credential exposure) | These are the cases where a defect converts a "minor UX issue" into a **HIPAA compliance finding**. Username enumeration on a healthcare portal effectively confirms "this person is a patient here," which is itself a PHI-adjacent disclosure. This is explicitly called out as a *security requirement* in the ticket (AC3), not left to inference — it must not regress, ever. |
| **P1** | AC1 valid-login → dashboard redirect | The happy path is the foundation every other patient-facing feature depends on; total blocker if broken, and the baseline comparator for "does the negative path *actually* differ only where it should." |
| **P2** | AC4 empty-field validation (and adjacent boundary inputs: whitespace-only, max-length, special characters) | High-frequency real-world occurrence (typos, partially-filled forms) and a usability/trust signal, but a defect here is recoverable by the user and does not by itself expose PHI or violate a stated security requirement — hence one tier below the enumeration/auth-bypass cluster. |
| **P3** | Exploratory charters, secondary UI polish (focus order, placeholder text, "remember me" cosmetics if present) | Valuable for catching the unknown-unknowns and for overall quality, but lowest risk to the feature's core promise (secure access to PHI) and lowest likelihood of blocking release. |

This ordering means: if time/resources are constrained, the AC2/AC3-and-security cluster and
the AC1 happy path are **never** the cases that get cut — they are the two halves of the
feature's core security and functional promise. AC4 and exploratory work are the first to flex.

## 7. Entry / Exit Criteria (Strategy Level)

**Entry criteria** — testing of this feature is ready to begin when:
- The login page is deployed to an environment reachable by the existing `EnvironmentConfig`
  setup (local/staging), with a known set of synthetic patient credentials available.
- The backend authentication endpoint(s) backing AC1–AC3 are stable enough to return
  consistent status codes/messages (i.e., not actively under construction).
- The `regular_user` fixture (or equivalent patient-provisioning mechanism) is able to create
  and tear down a test patient account via the API without manual intervention.

**Exit criteria** — this feature is considered strategy-complete when:
- All four acceptance criteria (AC1–AC4) have corresponding passing automated checks at the
  appropriate layer (UI for user-visible behaviour, API for backend parity/security checks).
- The AC2/AC3 generic-error-message parity has been verified at **both** the UI (visible text)
  and API (status code, payload shape, response-time) levels — this is the single
  non-negotiable security gate for this ticket.
- No P1-classified defect (see §6) remains open.
- The HIPAA audit trail correctly records failed and successful login attempts with
  credentials/PHI masked, verified against existing `AuditLogger` masking behaviour.
- The exploratory charter has been run at least once and any findings triaged (not
  necessarily resolved, but consciously accepted or ticketed).

## 8. Key Risks & Mitigations

| Risk | Why it matters here | Mitigation |
|---|---|---|
| **Username/account enumeration via subtle differences** (status code, message wording, response timing, field highlighting) between "wrong password" and "unknown username" | Directly contradicts AC3, which exists *because* this is a security requirement; on a healthcare portal it effectively discloses "this person is a patient here" — a PHI-adjacent leak | Test AC2 and AC3 as a **paired comparison**, not two isolated cases — assert message text, status code, payload shape, and response-time band are indistinguishable; cover this at both UI and API layers (§4.1/4.2) |
| **Sensitive data exposure in transit/at rest** (passwords in logs, network traces, browser storage, autocomplete) | HIPAA §164.312 technical-safeguard exposure; Playwright's trace/video/screenshot-on-failure artifacts (enabled by default per `pytest.ini`) could themselves leak credentials if not handled carefully | Use synthetic, non-real patient credentials only; verify `AuditLogger`'s `_mask_phi`/`_MASKED_FIELDS` behaviour covers login payloads; review captured traces/screenshots for credential leakage as part of the security pass |
| **Injection / malformed-input handling** (SQLi, script injection, oversized input in login fields) | Login is an unauthenticated, internet-facing entry point — the highest-value target for injection attacks against a system holding PHI | Include negative/security probes with injection-style payloads as first-class P1 cases (§4.3), asserting safe rejection and no reflection in UI or logs |
| **Inconsistent or environment-dependent credentials** breaking valid-login tests (AC1) and polluting shared environments | The strategy depends on `regular_user`/`AuthAPI`-style provisioning; if that's flaky, the "happy path" baseline becomes unreliable and erodes confidence in the negative-path comparisons that depend on it | Rely on the existing fixture-based create/teardown lifecycle (per CLAUDE.md "User lifecycle") rather than static or shared accounts; never hardcode patient credentials in test code |
| **Over-indexing on scripted ACs and missing real-world login quirks** (double-submit, back-button after failed login, multi-tab sessions) | Scripted suites validate *known* requirements; login is a high-traffic, high-variance surface where real users do unexpected things | Reserve a time-boxed exploratory charter (§4.4) specifically for the login page, run close to feature completion, with findings triaged against the P1–P3 model in §6 |
| **Scope creep into adjacent flows** (password reset, MFA, SSO, admin/doctor login) inflating the test surface and diluting focus on this ticket's core security requirement | The ticket explicitly excludes these; conflating them risks both wasted effort and a diluted security review of the actual in-scope flow | Anything from the out-of-scope list encountered incidentally is checked only for "doesn't crash / doesn't block," with full coverage deferred to its own ticket's strategy |
