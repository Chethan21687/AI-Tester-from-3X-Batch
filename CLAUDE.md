# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `Playwright_8_layer_architecture/`:

```bash
# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Run all tests
pytest

# Run a single test file
pytest tests/e2e/auth/test_login.py

# Run a single test by name
pytest tests/e2e/auth/test_login.py::TestLogin::test_login_with_valid_credentials

# Run against a specific environment
ENV=staging pytest

# Run with visible browser
pytest --headed

# Debug a test
pytest --headed --slowmo 500 tests/e2e/auth/test_login.py

# View HTML report after run
start test-results/report.html
```

Credentials for staging/production come from env vars `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Architecture: 8-Layer Structure

The `Playwright_8_layer_architecture/` directory enforces strict layer separation. Each layer imports only from layers below it.

```
Layer 1 — Config:      environments.py        ENV var selects local/staging/production
Layer 2 — Test Data:   models/ + factories/   Dataclasses (User, Product) + factory builders
Layer 3 — API:         base_api.py + clients/ Playwright APIRequestContext wrappers for REST calls
Layer 4 — Fixtures:    conftest.py            pytest fixtures; creates/tears down users via API
Layer 5 — Components:  base_component.py      Reusable UI pieces (Header, Nav, Modal)
Layer 6 — Pages:       base_page.py + pages   Page Object Model; each page composes components
Layer 7 — Helpers:     assertions/wait/data   Cross-cutting test utilities
Layer 8 — Tests:       tests/e2e/             Actual specs; use only fixtures and page objects
```

### Key patterns

**User lifecycle** — `conftest.py` fixtures (`regular_user`, `admin_user`) create users via `AuthAPI` before the test and delete them after. Never create users directly in test code.

**Pre-authenticated pages** — `authenticated_page` / `admin_page` fixtures inject a JWT into `localStorage` via `browser.new_context(storage_state=...)`, bypassing the login UI. Use these instead of logging in through the UI when testing non-auth flows.

**API client pattern** — `BaseAPI` (layer 3) wraps `APIRequestContext`. All HTTP calls raise `RuntimeError` on non-2xx. Concrete clients (`AuthAPI`, `ProductsAPI`) extend it and add typed methods.

**Page objects** — `BasePage` is abstract with a required `goto()`. Pages hold locators as instance attributes and expose action methods (`login()`, `expect_error()`). Components (`HeaderComponent`, `NavigationComponent`) are composed inside `BasePage.__init__`.

### Root-level `login.py`

Standalone Python module (no Playwright). Validates username/password with regex and returns a `LoginResult` dataclass. Not part of the 8-layer test suite — it's a separate learning exercise.

## pytest.ini defaults

Tests default to `--browser chromium` with screenshots on failure, video on failure, and tracing on first retry. HTML report written to `test-results/report.html`.
