"""Pytest fixtures. Chromium-only launch; auth + page-object wiring; HTML report hooks."""
from __future__ import annotations

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright

from config import Settings, get_settings
from pages import DashboardPage, LoginPage


# ---- session config -----------------------------------------------------
@pytest.fixture(scope="session")
def settings() -> Settings:
    return get_settings()


@pytest.fixture(scope="session")
def _playwright():
    with sync_playwright() as pw:
        yield pw


@pytest.fixture(scope="session")
def browser(_playwright, settings: Settings) -> Browser:
    # Chromium-only by design (PRD QA scope). No other engine is launched.
    browser = _playwright.chromium.launch(
        headless=settings.headless, slow_mo=settings.slow_mo
    )
    yield browser
    browser.close()


@pytest.fixture
def context(browser: Browser) -> BrowserContext:
    ctx = browser.new_context(viewport={"width": 1366, "height": 900})
    yield ctx
    ctx.close()


@pytest.fixture
def page(context: BrowserContext, settings: Settings) -> Page:
    pg = context.new_page()
    pg.set_default_timeout(settings.default_timeout_ms)
    yield pg


# ---- page-object fixtures ----------------------------------------------
@pytest.fixture
def login_page(page: Page, settings: Settings) -> LoginPage:
    return LoginPage(page, settings).goto()


@pytest.fixture
def authenticated_page(page: Page, settings: Settings) -> Page:
    """Log in with admin creds. Skips if credentials are not provisioned."""
    creds = settings.credentials
    if not creds.has_admin:
        pytest.skip("VWO_EMAIL / VWO_PASSWORD not set; live-auth test skipped")
    lp = LoginPage(page, settings).goto()
    lp.login(creds.email, creds.password)
    DashboardPage(page, settings).expect_loaded()
    return page


# ---- pytest-html metadata ----------------------------------------------
def pytest_html_report_title(report) -> None:
    report.title = "VWO DXO - Automated Test Report (Chromium)"


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Attach a Chromium screenshot to the HTML report on failure."""
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        page = item.funcargs.get("page")
        if page is not None:
            try:
                from pathlib import Path

                Path("reports").mkdir(exist_ok=True)
                shot = f"reports/{item.name}.png"
                page.screenshot(path=shot, full_page=True)
            except Exception:
                pass
