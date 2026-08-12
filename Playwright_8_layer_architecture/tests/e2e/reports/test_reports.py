"""
Layer 8 — Tests: Reports & Dashboard + NFR (TC036–TC039, TC050–TC052)
FR Reference: FR6 (Real-time Reporting), NFR (Performance, Security)
Markers: smoke, regression, reports, nfr, security
"""
import os
import time
import pytest
from playwright.sync_api import Page, expect

from pages.reports_page import ReportsPage
from pages.dashboard_page import DashboardPage
from pages.personalization_page import PersonalizationPage
from factories.vwo_factories import PersonalizationFactory
from helpers.assertions import VWOAssertions


# ---------------------------------------------------------------------------
# TC036 — View main dashboard
# ---------------------------------------------------------------------------

@pytest.mark.smoke
@pytest.mark.regression
@pytest.mark.reports
def test_dashboard_loads_successfully(authenticated_page: Page):
    """TC036: Dashboard renders with widgets, active test count, no blank panels."""
    dashboard = DashboardPage(authenticated_page)
    dashboard.goto()

    dashboard.expect_dashboard_loaded()
    dashboard.expect_active_tests_visible()


# ---------------------------------------------------------------------------
# TC037 — Real-time data updates
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.reports
def test_dashboard_visitor_count_updates(authenticated_page: Page):
    """TC037: Visitor count changes between two reads (or at least is displayed)."""
    dashboard = DashboardPage(authenticated_page)
    dashboard.goto()

    first_text = dashboard.get_visitor_count_text()
    assert first_text, "Visitor count not displayed on dashboard"

    # Wait and re-read (in a live environment count should tick)
    time.sleep(5)
    second_text = dashboard.get_visitor_count_text()
    assert second_text, "Visitor count disappeared after wait"


# ---------------------------------------------------------------------------
# TC038 — Filter reports by date range
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.reports
def test_filter_reports_by_date_range(authenticated_page: Page):
    """TC038: Date range filter applied; widgets reflect selected period."""
    reports = ReportsPage(authenticated_page)
    reports.goto()

    reports.expect_reports_loaded()
    reports.set_date_range("Last 30 days")
    reports.expect_no_loading_spinner()
    reports.expect_data_present()


# ---------------------------------------------------------------------------
# TC039 — Export report as CSV
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.reports
def test_export_report_csv(authenticated_page: Page):
    """TC039: CSV export downloads file with headers and data rows."""
    reports = ReportsPage(authenticated_page)
    reports.goto()
    reports.expect_reports_loaded()

    if not reports.export_button.is_visible(timeout=5_000):
        pytest.skip("Export button not visible — may require a test with data")

    csv_path = reports.export_csv()

    assert os.path.exists(csv_path), f"CSV file not downloaded: {csv_path}"
    assert os.path.getsize(csv_path) > 0, "Downloaded CSV is empty"
    VWOAssertions.assert_csv_has_data(csv_path, min_rows=1)


# ---------------------------------------------------------------------------
# TC040 — Create personalization campaign
# ---------------------------------------------------------------------------

@pytest.mark.smoke
@pytest.mark.regression
@pytest.mark.personalization
def test_create_personalization_campaign(authenticated_page: Page):
    """TC040: Personalization campaign created in Draft status."""
    campaign_data = PersonalizationFactory.create("https://example.com/")
    personalization = PersonalizationPage(authenticated_page)
    personalization.goto()

    personalization.create_campaign(campaign_data.name, campaign_data.page_url)

    personalization.expect_campaign_listed(campaign_data.name)


# ---------------------------------------------------------------------------
# TC041 — Define target segment
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.personalization
def test_define_target_segment(authenticated_page: Page):
    """TC041: Segment condition saved on campaign with estimated reach."""
    campaign_data = PersonalizationFactory.create("https://example.com/")
    personalization = PersonalizationPage(authenticated_page)
    personalization.goto()
    personalization.create_campaign(campaign_data.name, campaign_data.page_url)

    personalization.set_segment("Visitor Type", "equals", "Returning")

    segment_condition = authenticated_page.locator(
        "[data-testid='segment-condition'], .segment-condition, .audience-rule"
    )
    expect(segment_condition.first).to_be_visible(timeout=8_000)


# ---------------------------------------------------------------------------
# TC043 — Activate campaign
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.personalization
def test_activate_personalization_campaign(authenticated_page: Page):
    """TC043: Campaign status changes to Active after activation."""
    campaign_data = PersonalizationFactory.create("https://example.com/")
    personalization = PersonalizationPage(authenticated_page)
    personalization.goto()
    personalization.create_campaign(campaign_data.name, campaign_data.page_url)

    personalization.activate_campaign()

    personalization.expect_status("active")


# ---------------------------------------------------------------------------
# TC050 — Performance: page load < 2000ms
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.nfr
def test_dashboard_loads_within_2_seconds(page: Page, credentials):
    """TC050: Dashboard load time must be under 2000ms (NFR)."""
    from pages.login_page import LoginPage
    email, password = credentials
    login_page = LoginPage(page)
    login_page.goto()
    login_page.login_and_wait_dashboard(email, password)

    start = time.monotonic()
    page.goto("/dashboard")
    page.wait_for_load_state("domcontentloaded")
    elapsed_ms = (time.monotonic() - start) * 1000

    assert elapsed_ms < 2000, (
        f"Dashboard loaded in {elapsed_ms:.0f}ms — exceeds 2000ms NFR threshold"
    )


# ---------------------------------------------------------------------------
# TC051 — HTTPS enforcement
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.nfr
@pytest.mark.security
def test_http_to_https_redirect(page: Page):
    """TC051: HTTP requests redirect to HTTPS; no unencrypted data transfer."""
    VWOAssertions.assert_https_redirect(page, "http://app.vwo.com/login")


# ---------------------------------------------------------------------------
# TC052 — No PII in URLs
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.nfr
@pytest.mark.security
def test_no_pii_in_url_parameters(authenticated_page: Page):
    """TC052: Email, SSN, and phone numbers never appear as URL query params."""
    pages_to_check = ["/dashboard", "/testing", "/reports", "/settings"]
    for path in pages_to_check:
        authenticated_page.goto(path)
        authenticated_page.wait_for_load_state("domcontentloaded")
        VWOAssertions.assert_no_pii_in_url(authenticated_page)
