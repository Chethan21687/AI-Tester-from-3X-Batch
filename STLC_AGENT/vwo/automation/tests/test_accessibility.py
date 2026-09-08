"""Accessibility specs (WCAG 2.1 AA). Maps TC-032..034.

Uses axe-core via axe-playwright-python. TC-032 runs on the public login page so
it executes without credentials; TC-033/034 need an authenticated surface.
"""
from __future__ import annotations

import pytest

from pages import DashboardPage

axe = pytest.importorskip("axe_playwright_python.sync_playwright",
                          reason="axe-playwright-python not installed")
from axe_playwright_python.sync_playwright import Axe  # noqa: E402

_SERIOUS = {"serious", "critical"}


def _serious_violations(results) -> list:
    return [v for v in results.response["violations"] if v["impact"] in _SERIOUS]


@pytest.mark.accessibility
def test_login_page_wcag_aa(login_page):
    """TC-032 - login page has no serious/critical AA violations."""
    results = Axe().run(login_page.page)
    violations = _serious_violations(results)
    assert not violations, f"AA violations on login: {[v['id'] for v in violations]}"


@pytest.mark.accessibility
@pytest.mark.requires_auth
def test_dashboard_keyboard_navigation(authenticated_page, settings):
    """TC-033 - dashboard reachable/operable by keyboard only."""
    dash = DashboardPage(authenticated_page, settings)
    assert dash.first_focusable_reachable_by_keyboard(), "First Tab must land on interactive element"


@pytest.mark.accessibility
@pytest.mark.requires_auth
def test_editor_controls_have_accessible_names(authenticated_page, settings):
    """TC-034 - editor toolbar controls expose accessible names/roles."""
    page = authenticated_page
    page.goto(f"{settings.base_url}/experiments/new")
    results = Axe().run(page)
    aria_ids = {v["id"] for v in results.response["violations"]}
    assert "button-name" not in aria_ids, "Editor buttons must have accessible names"
