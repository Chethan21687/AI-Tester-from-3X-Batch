"""Authentication + RBAC specs. Maps TC-001..004, TC-007.

Data-driven from the RICEPOT CSV via the pandas loader. Live-auth cases skip
gracefully when credentials are not provisioned, so the suite stays green in CI
without secrets while remaining executable against a real tenant.
"""
from __future__ import annotations

import pytest

from pages import DashboardPage, LoginPage
from utils.test_data_loader import get_case


@pytest.mark.security
@pytest.mark.requires_auth
def test_login_valid_credentials(authenticated_page, settings):
    """TC-001 - valid login redirects to dashboard."""
    case = get_case("TC-001")
    dash = DashboardPage(authenticated_page, settings)
    assert dash.is_authenticated(), case.expected


@pytest.mark.security
@pytest.mark.requires_auth
def test_login_invalid_password(login_page: LoginPage, settings):
    """TC-002 - wrong password is rejected, no session granted."""
    creds = settings.credentials
    if not creds.has_admin:
        pytest.skip("VWO_EMAIL not set")
    login_page.login(creds.email, "definitely-wrong-password")
    login_page.expect_error_visible()
    assert "login" in login_page.current_url().lower() or login_page.current_url().endswith("/")


@pytest.mark.functional
def test_login_empty_submit_shows_validation(login_page: LoginPage):
    """TC-003 - empty submit blocked by client-side validation."""
    login_page.expect_login_form_visible()
    login_page.submit_empty()
    # form must not navigate away on empty submit
    assert "/dashboard" not in login_page.current_url()


@pytest.mark.functional
def test_login_email_format_validation(login_page: LoginPage):
    """TC-004 - malformed email flagged by HTML5 validity (no backend call)."""
    login_page.email_input.fill("notanemail")
    login_page.password_input.fill("whatever123")
    assert login_page.is_email_invalid(), "Malformed email should fail field validity"


@pytest.mark.security
@pytest.mark.requires_auth
def test_analyst_cannot_edit_experiment(page, settings):
    """TC-007 - RBAC: analyst role has no experiment edit controls."""
    creds = settings.credentials
    if not creds.has_analyst:
        pytest.skip("VWO_ANALYST_EMAIL / VWO_ANALYST_PASSWORD not set")
    lp = LoginPage(page, settings).goto()
    lp.login(creds.analyst_email, creds.analyst_password)
    page.goto(f"{settings.base_url}/experiments")
    edit_controls = page.get_by_role("button", name="Edit")
    assert edit_controls.count() == 0, "Analyst must not see experiment edit controls"
