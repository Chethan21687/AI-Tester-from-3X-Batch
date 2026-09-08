# VWO DXO — Playwright Automation Suite

Python + Playwright automation for the VWO test cases (`../02_VWO_TestCases.csv`).
**Chromium-only** per the test plan's QA scope. OOP page objects, dataclass config/test-data,
pandas-driven data loading, pytest-html reports.

## Layout

```
automation/
  config.py                 # Layer 1 - dataclass Settings + Credentials (env-driven)
  conftest.py               # Chromium-only fixtures, auth wiring, HTML report hooks
  pytest.ini                # markers + --browser chromium + pytest-html
  pages/                    # OOP Page Object Model
    base_page.py            #   abstract BasePage (requires goto())
    login_page.py
    dashboard_page.py
    experiment_page.py      #   includes ExperimentSpec dataclass (test data)
    plan_board_page.py
  utils/
    test_data_loader.py     # pandas: reads RICEPOT CSV -> TestCase dataclass
  tests/
    test_authentication.py  # TC-001..004, 007
    test_experiment.py      # TC-008..011, 016
    test_workflow.py        # TC-031
    test_accessibility.py   # TC-032..034 (axe-core)
    test_regression.py      # TC-035 + credential-free repo/coverage guards
  reports/                  # generated HTML report + failure screenshots
```

## Setup

```bash
cd STLC_AGENT/vwo/automation
py -m pip install -r requirements.txt
py -m playwright install chromium
```

## Credentials (live runs)

Auth-dependent tests skip cleanly when these are unset:

```bash
set VWO_EMAIL=you@example.com
set VWO_PASSWORD=secret
set VWO_ANALYST_EMAIL=analyst@example.com   # for RBAC TC-007
set VWO_ANALYST_PASSWORD=secret
```

## Run

```bash
py -m pytest                              # full suite -> reports/report.html
py -m pytest -m accessibility             # by marker
py -m pytest -m "regression and not requires_auth"   # credential-free guards only
py -m pytest tests/test_authentication.py::test_login_email_format_validation
set HEADLESS=false && py -m pytest        # headed Chromium (debug)
start reports/report.html                 # view report
```

## Design notes

- **Chromium-only:** `conftest.browser` launches `chromium` exclusively; `Settings.browser` is fixed.
- **Data-driven:** specs pull expected results from the CSV via `utils.test_data_loader` (pandas).
- **Skip-safe:** `requires_auth` tests `pytest.skip` without creds, so CI stays green without secrets
  while `test_regression.py` repo/coverage guards still give a real pass/fail signal.
- **Resilient locators:** role/label-based with attribute fallbacks (`.or_(...)`) per the test plan's
  anti-brittleness guidance. Selectors are best-effort against `app.vwo.com` and should be tuned to the
  live DOM during first execution against a real tenant.
- **Reporting:** pytest-html self-contained report; Chromium full-page screenshot attached on failure.
```
