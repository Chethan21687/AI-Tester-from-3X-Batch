# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Two independent test frameworks live side-by-side:

| Directory | Purpose | HTTP layer |
|---|---|---|
| `Playwright_8_layer_architecture/` | Browser E2E tests | Playwright `APIRequestContext` |
| `Healthcare_API_Framework/` | REST API tests (HIPAA) | `requests` library |
| `BLAST_Framework/` | Methodology docs only | — |

---

## Playwright E2E Framework

All commands run from `Playwright_8_layer_architecture/`:

```bash
pip install -r requirements.txt
playwright install chromium

pytest                                                          # all tests
pytest tests/e2e/auth/test_login.py                            # single file
pytest tests/e2e/auth/test_login.py::TestLogin::test_login_with_valid_credentials
ENV=staging pytest                                             # target env
pytest --headed                                                # visible browser
pytest --headed --slowmo 500 tests/e2e/auth/test_login.py     # debug
start test-results/report.html                                 # view report
```

Credentials for staging/production come from env vars `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### 8-Layer Architecture

Each layer imports only from layers below it.

```
Layer 1 — Config:      environments.py        ENV var → local/staging/production
Layer 2 — Test Data:   models/ + factories/   Dataclasses (User, Product) + factory builders
Layer 3 — API:         base_api.py + clients/ Playwright APIRequestContext wrappers
Layer 4 — Fixtures:    conftest.py            pytest fixtures; creates/tears down users via API
Layer 5 — Components:  base_component.py      Reusable UI pieces (Header, Nav, Modal)
Layer 6 — Pages:       base_page.py + pages/  Page Object Model; each page composes components
Layer 7 — Helpers:     assertions/wait/data   Cross-cutting test utilities
Layer 8 — Tests:       tests/e2e/             Actual specs; use only fixtures and page objects
```

### Key Patterns

**User lifecycle** — `conftest.py` fixtures (`regular_user`, `admin_user`) create users via `AuthAPI` before each test and delete them after. Never create users directly in test code.

**Pre-authenticated pages** — `authenticated_page` / `admin_page` fixtures inject a JWT into `localStorage` via `browser.new_context(storage_state=...)`, bypassing the login UI. Use these for non-auth flows.

**API client pattern** — `BaseAPI` wraps `APIRequestContext`. All HTTP calls raise `RuntimeError` on non-2xx. Concrete clients (`AuthAPI`, `ProductsAPI`) extend it with typed methods.

**Page objects** — `BasePage` is abstract with a required `goto()`. Locators are instance attributes; action methods are `login()`, `expect_error()`, etc. Components (`HeaderComponent`, `NavigationComponent`) are composed in `BasePage.__init__`.

### pytest.ini Defaults

`--browser chromium`, screenshots on failure, video on failure, tracing on first retry. HTML report → `test-results/report.html`.

### Root-Level `login.py`

Standalone module (no Playwright). Validates username/password with regex; returns a `LoginResult` dataclass. Separate learning exercise, not part of the 8-layer suite.

---

## Healthcare API Framework

All commands run from `Healthcare_API_Framework/`:

```bash
pip install -r requirements.txt

pytest                                              # all tests
pytest -m smoke                                    # by marker
pytest -m "auth and regression"                    # combined markers
pytest tests/test_authentication.py               # single file
pytest tests/test_authentication.py::TestAuthentication::test_login_valid
ENV=staging pytest                                 # target env (default: staging)
start output/report.html                           # view HTML report
```

Credentials come from `configuration/credentials.json` (not env vars). File is gitignored; roles are `admin`, `doctor`, `patient`.

### Layer Architecture

```
configuration/    environments.py     ENV var → local/staging/production/sandbox; loads credentials.json
endpoints/        endpoints.py        Endpoint constant classes (AuthEndpoints, PatientEndpoints, …)
payloads/                             Request payload builder functions per resource
services/         base_service.py     requests.Session with retry adapter; returns standardized response dict
business/                             Orchestrates service calls + assertions; manages token cache
utilities/        assertions.py       ResponseAssertions, SLAThresholds
                  audit_logger.py     HIPAA audit trail (singleton); PHI masking before log write
                  output_manager.py   Console output formatting
                  schema_validator.py JSON schema validation helpers
testdata/                             Static test data fixtures
tests/                                Actual test files; use business-layer objects only
```

### Key Patterns

**Session-scoped tokens** — `conftest.py` fixtures (`admin_token`, `doctor_token`, `patient_token`) are `scope="session"`. Tokens are fetched once and reused. Tests that need a token accept one as a fixture parameter and pass it when constructing a service.

**Response dict contract** — every `BaseService._execute()` call returns:
```python
{
    "status_code": int,
    "response_time_ms": float,
    "url": str,
    "correlation_id": str,   # UUID, sent as X-Correlation-ID header
    "body": dict,
    "headers": dict          # absent on connection errors
}
```
Connection errors return `status_code=0`; timeouts return `status_code=408`.

**Assertions** — use `ResponseAssertions` methods. Field paths use dot notation: `assert_field_present(body, "data.patient_id")`.

**HIPAA constraints** — `AuditLogger` is a singleton; it masks SSN, phone, email, and DOB patterns before writing to `logs/audit.log`. Fields `password`, `client_secret`, `access_token`, `refresh_token`, `ssn_last4` are never logged. SSL is enforced for all non-local environments (`verify_ssl=True` in `EnvironmentConfig`).

### pytest Markers

`smoke` · `regression` · `integration` · `auth` · `patient` · `provider` · `appointment` · `disease` · `case_mgmt` · `assessment`

### pytest.ini Defaults

`-v --tb=short`, HTML report → `output/report.html`, log file → `logs/test_execution.log` (INFO), `logs/audit.log` (audit trail), 2 auto-reruns with 1 s delay.
