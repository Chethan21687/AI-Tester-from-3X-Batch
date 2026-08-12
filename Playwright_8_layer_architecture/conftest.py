"""Layer 4 — Fixtures: pytest fixtures providing browser contexts and auth state."""
import os
import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright, sync_playwright

from configuration.environments import get_config, get_credentials
from api.clients.auth_api import AuthAPI


# ---------------------------------------------------------------------------
# Browser / context fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def env_config():
    return get_config()


@pytest.fixture(scope="session")
def credentials():
    return get_credentials()


@pytest.fixture(scope="session")
def browser_session(env_config):
    """Single Playwright browser instance shared across the session."""
    with sync_playwright() as pw:
        launch_opts = {
            "headless": env_config.headless,
            "slow_mo": env_config.slow_mo_ms,
        }
        browser = pw.chromium.launch(**launch_opts)
        yield browser
        browser.close()


@pytest.fixture
def context(browser_session, env_config):
    """Fresh browser context per test — isolated cookies/storage."""
    ctx = browser_session.new_context(
        base_url=env_config.base_url,
        ignore_https_errors=not env_config.verify_ssl,
        viewport={"width": 1280, "height": 800},
        record_video_dir="test-results/videos" if os.getenv("VIDEO") else None,
    )
    ctx.set_default_timeout(env_config.timeout_ms)
    yield ctx
    ctx.close()


@pytest.fixture
def page(context: BrowserContext) -> Page:
    """Blank page in fresh context."""
    pg = context.new_page()
    yield pg
    pg.close()


# ---------------------------------------------------------------------------
# Authenticated page fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def admin_storage_state(browser_session, env_config, credentials, tmp_path_factory):
    """
    Log in via UI once per session; save storage state to disk.
    All tests using `authenticated_page` reuse this state (no re-login per test).
    """
    email, password = credentials
    state_path = str(tmp_path_factory.mktemp("auth") / "admin_state.json")

    ctx = browser_session.new_context(
        base_url=env_config.base_url,
        ignore_https_errors=not env_config.verify_ssl,
    )
    ctx.set_default_timeout(env_config.timeout_ms)
    pg = ctx.new_page()

    pg.goto("/login")
    pg.get_by_label("Email").fill(email)
    pg.get_by_label("Password").fill(password)
    pg.get_by_role("button", name="Sign In").click()
    pg.wait_for_url("**/dashboard**", timeout=15_000)

    ctx.storage_state(path=state_path)
    pg.close()
    ctx.close()

    return state_path


@pytest.fixture
def authenticated_page(browser_session, env_config, admin_storage_state) -> Page:
    """Pre-authenticated page — injects session state, bypasses login UI."""
    ctx = browser_session.new_context(
        base_url=env_config.base_url,
        storage_state=admin_storage_state,
        ignore_https_errors=not env_config.verify_ssl,
        viewport={"width": 1280, "height": 800},
    )
    ctx.set_default_timeout(env_config.timeout_ms)
    pg = ctx.new_page()
    yield pg
    pg.close()
    ctx.close()


# ---------------------------------------------------------------------------
# Screenshot on failure
# ---------------------------------------------------------------------------

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        page: Page | None = item.funcargs.get("page") or item.funcargs.get("authenticated_page")
        if page:
            screenshot_dir = "test-results/screenshots"
            os.makedirs(screenshot_dir, exist_ok=True)
            safe_name = item.nodeid.replace("/", "_").replace("::", "__").replace(" ", "_")
            page.screenshot(path=f"{screenshot_dir}/{safe_name}.png", full_page=True)
