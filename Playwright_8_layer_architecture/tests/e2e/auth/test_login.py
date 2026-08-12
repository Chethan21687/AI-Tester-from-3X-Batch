"""
Layer 8 — Tests: Authentication tests (TC001–TC009)
FR Reference: Security / NFR
Markers: smoke, regression, auth, security
"""
import pytest
from playwright.sync_api import Page, expect

from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from configuration.environments import get_credentials


# ---------------------------------------------------------------------------
# TC001 — Valid login
# ---------------------------------------------------------------------------

@pytest.mark.smoke
@pytest.mark.regression
@pytest.mark.auth
def test_login_with_valid_credentials(page: Page, credentials):
    """TC001: Successful login with correct email and password."""
    email, password = credentials
    login_page = LoginPage(page)
    login_page.goto()

    login_page.login_and_wait_dashboard(email, password)

    dashboard = DashboardPage(page)
    dashboard.expect_dashboard_loaded()
    dashboard.header.expect_logged_in()
    assert "dashboard" in page.url.lower(), f"Expected dashboard URL, got: {page.url}"


# ---------------------------------------------------------------------------
# TC002 — Invalid email
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.auth
def test_login_with_invalid_email(page: Page):
    """TC002: Login rejected for nonexistent email."""
    login_page = LoginPage(page)
    login_page.goto()

    login_page.login("nonexistent_user_xyz@invalid-domain-test.com", "anyPassword123")

    login_page.expect_error_visible()
    login_page.expect_on_login_page()


# ---------------------------------------------------------------------------
# TC003 — Wrong password
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.auth
@pytest.mark.security
def test_login_with_wrong_password(page: Page, credentials):
    """TC003: Login rejected when correct email + wrong password."""
    email, _ = credentials
    login_page = LoginPage(page)
    login_page.goto()

    login_page.login(email, "WrongPassword!@#999")

    login_page.expect_error_visible()
    login_page.expect_on_login_page()


# ---------------------------------------------------------------------------
# TC004 — Empty fields
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.auth
def test_login_with_empty_fields(page: Page):
    """TC004: Submitting blank form shows validation errors."""
    login_page = LoginPage(page)
    login_page.goto()

    login_page.sign_in_button.click()

    # Either HTML5 validation or app-level error
    page_url_unchanged = "login" in page.url.lower()
    assert page_url_unchanged, "Form submitted with empty fields — should have been blocked"

    # Check that at least one error indicator is shown
    email_empty_error = (
        login_page.error_message.is_visible()
        or page.locator("input:invalid").count() > 0
        or page.locator("[class*='error'], [class*='invalid']").count() > 0
    )
    assert email_empty_error, "No validation error shown for empty form"


# ---------------------------------------------------------------------------
# TC005 — 2FA verification
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.auth
@pytest.mark.security
def test_2fa_setup_page_accessible(page: Page, authenticated_page: Page):
    """TC005: 2FA settings page accessible for admin users."""
    authenticated_page.goto("/settings/security")
    authenticated_page.wait_for_load_state("domcontentloaded")

    two_fa_section = authenticated_page.locator(
        "[data-testid='2fa-section'], .two-factor-auth, #two-factor-authentication"
    )
    expect(two_fa_section).to_be_visible(timeout=10_000)


# ---------------------------------------------------------------------------
# TC006 — Logout
# ---------------------------------------------------------------------------

@pytest.mark.smoke
@pytest.mark.regression
@pytest.mark.auth
def test_logout_terminates_session(page: Page, credentials):
    """TC006: Logout redirects to login page and invalidates session."""
    email, password = credentials
    login_page = LoginPage(page)
    login_page.goto()
    login_page.login_and_wait_dashboard(email, password)

    dashboard = DashboardPage(page)
    dashboard.header.click_logout()

    page.wait_for_url("**/login**", timeout=10_000)
    expect(login_page.sign_in_button).to_be_visible()

    # Back navigation must not restore session
    page.go_back()
    page.wait_for_load_state("domcontentloaded")
    assert "login" in page.url.lower() or "dashboard" not in page.url.lower(), (
        "Session persisted after logout — back button restored authenticated state"
    )


# ---------------------------------------------------------------------------
# TC007 — Session persistence after re-navigation
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.auth
def test_authenticated_session_persists_across_navigation(authenticated_page: Page):
    """TC007: Session remains valid when navigating between app sections."""
    dashboard = DashboardPage(authenticated_page)
    dashboard.goto()
    dashboard.expect_dashboard_loaded()

    # Navigate away and back
    authenticated_page.goto("/testing")
    authenticated_page.wait_for_load_state("domcontentloaded")

    authenticated_page.goto("/reports")
    authenticated_page.wait_for_load_state("domcontentloaded")

    # Should not be redirected to login
    assert "login" not in authenticated_page.url.lower(), (
        f"Session expired during navigation. Current URL: {authenticated_page.url}"
    )


# ---------------------------------------------------------------------------
# TC008 — RBAC: Admin access
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.auth
@pytest.mark.security
def test_admin_can_access_settings(authenticated_page: Page):
    """TC008: Admin role has access to Settings section."""
    authenticated_page.goto("/settings")
    authenticated_page.wait_for_load_state("domcontentloaded")

    assert "login" not in authenticated_page.url.lower(), (
        "Admin redirected away from settings — possible RBAC failure"
    )
    settings_content = authenticated_page.locator(
        "[data-testid='settings-page'], .settings-container, h1"
    )
    expect(settings_content.first).to_be_visible(timeout=8_000)


# ---------------------------------------------------------------------------
# TC009 — HTTPS enforcement (NFR-Security)
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.auth
@pytest.mark.security
@pytest.mark.nfr
def test_http_redirects_to_https(page: Page):
    """TC009 / TC051: HTTP requests automatically upgrade to HTTPS."""
    from helpers.assertions import VWOAssertions
    VWOAssertions.assert_https_redirect(page, "http://app.vwo.com/login")
