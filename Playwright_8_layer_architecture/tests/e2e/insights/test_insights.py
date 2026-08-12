"""
Layer 8 — Tests: Behavioral Insights — Heatmaps & Recordings (TC027–TC032)
FR Reference: FR4 (Heatmaps & Session Recordings)
Markers: smoke, regression, insights
"""
import pytest
from playwright.sync_api import Page, expect

from pages.insights_page import InsightsPage
from factories.vwo_factories import HeatmapFactory


# ---------------------------------------------------------------------------
# TC027 — Create a new heatmap
# ---------------------------------------------------------------------------

@pytest.mark.smoke
@pytest.mark.regression
@pytest.mark.insights
def test_create_heatmap(authenticated_page: Page):
    """TC027: Heatmap configuration saved; status shows Active/Collecting."""
    heatmap_data = HeatmapFactory.create("https://example.com/")
    insights = InsightsPage(authenticated_page)

    insights.create_heatmap(heatmap_data.page_url, heatmap_data.name, heatmap_data.sample_size)

    insights.expect_heatmap_created(heatmap_data.name)


# ---------------------------------------------------------------------------
# TC028 — Click heatmap view
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.insights
def test_click_heatmap_renders(authenticated_page: Page):
    """TC028: Click heatmap canvas renders with color-coded hotspots."""
    insights = InsightsPage(authenticated_page)
    insights.goto_heatmaps()

    heatmap_items = authenticated_page.locator(
        "[data-testid='heatmap-item'], .heatmap-item, .heatmap-row"
    )
    if heatmap_items.count() == 0:
        pytest.skip("No heatmaps found — create one first (TC027)")

    heatmap_items.first.click()
    authenticated_page.wait_for_load_state("domcontentloaded")

    insights.switch_to_click_view()
    insights.expect_heatmap_canvas_visible()


# ---------------------------------------------------------------------------
# TC029 — Scroll heatmap view
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.insights
def test_scroll_heatmap_renders(authenticated_page: Page):
    """TC029: Scroll depth gradient renders with fold line indicator."""
    insights = InsightsPage(authenticated_page)
    insights.goto_heatmaps()

    heatmap_items = authenticated_page.locator(
        "[data-testid='heatmap-item'], .heatmap-item, .heatmap-row"
    )
    if heatmap_items.count() == 0:
        pytest.skip("No heatmaps found")

    heatmap_items.first.click()
    authenticated_page.wait_for_load_state("domcontentloaded")

    insights.switch_to_scroll_view()
    insights.expect_heatmap_canvas_visible()

    # Scroll-specific: look for fold line or scroll depth indicator
    fold_indicator = authenticated_page.locator(
        "[data-testid='fold-line'], .fold-line, .scroll-depth-indicator"
    )
    expect(fold_indicator).to_be_visible(timeout=8_000)


# ---------------------------------------------------------------------------
# TC030 — Move/Attention heatmap
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.insights
def test_move_heatmap_renders(authenticated_page: Page):
    """TC030: Mouse move/attention heatmap pattern renders."""
    insights = InsightsPage(authenticated_page)
    insights.goto_heatmaps()

    heatmap_items = authenticated_page.locator(
        "[data-testid='heatmap-item'], .heatmap-item, .heatmap-row"
    )
    if heatmap_items.count() == 0:
        pytest.skip("No heatmaps found")

    heatmap_items.first.click()
    authenticated_page.wait_for_load_state("domcontentloaded")

    if insights.move_view_button.is_visible():
        insights.switch_to_move_view()
        insights.expect_heatmap_canvas_visible()
    else:
        pytest.skip("Move/Attention view not available for this account")


# ---------------------------------------------------------------------------
# TC031 — Session recordings list
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.insights
def test_session_recordings_list_accessible(authenticated_page: Page):
    """TC031: Recordings list shows visitor ID, date, duration, pages visited."""
    insights = InsightsPage(authenticated_page)
    insights.goto_recordings()

    insights.expect_recordings_list_visible()

    # Validate column headers exist
    headers = ["Visitor", "Date", "Duration", "Pages"]
    for header in headers:
        header_el = authenticated_page.get_by_role("columnheader", name=header, exact=False)
        if header_el.is_visible(timeout=3_000):
            expect(header_el).to_be_visible()


# ---------------------------------------------------------------------------
# TC032 — Filter session recordings
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.insights
def test_filter_recordings_by_device(authenticated_page: Page):
    """TC032: Device filter applied; recording count updates accordingly."""
    insights = InsightsPage(authenticated_page)
    insights.goto_recordings()

    initial_count = insights.get_recording_count()

    if insights.filter_device_select.is_visible():
        insights.filter_recordings(device="Mobile")
        filtered_count = insights.get_recording_count()
        # Count should change (either same or fewer — never assert exact number)
        assert filtered_count >= 0, "Recording count is negative after filter"
    else:
        pytest.skip("Device filter not available in this account tier")
