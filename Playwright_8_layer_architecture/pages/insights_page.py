"""Layer 6 — Pages: VWO Insights — Heatmaps and Session Recordings."""
from playwright.sync_api import Page, expect

from pages.base_page import BasePage


class InsightsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        # Navigation tabs within Insights
        self.heatmaps_tab = page.get_by_role("tab", name="Heatmaps")
        self.recordings_tab = page.get_by_role("tab", name="Recordings")
        self.surveys_tab = page.get_by_role("tab", name="Surveys")

        # Heatmap creation
        self.create_heatmap_button = page.get_by_role("button", name="Create Heatmap")
        self.heatmap_url_input = page.get_by_label("Page URL")
        self.heatmap_name_input = page.get_by_label("Heatmap Name")
        self.sample_size_input = page.get_by_label("Sample Size")
        self.save_heatmap_button = page.get_by_role("button", name="Save")

        # Heatmap views
        self.click_view_button = page.get_by_role("button", name="Click")
        self.scroll_view_button = page.get_by_role("button", name="Scroll")
        self.move_view_button = page.get_by_role("button", name="Move")
        self.heatmap_canvas = page.locator(
            "[data-testid='heatmap-canvas'], canvas.heatmap, .heatmap-overlay"
        )
        self.heatmap_list = page.locator(
            "[data-testid='heatmap-list'], .heatmap-list, .heatmaps-table"
        )

        # Recordings
        self.recordings_list = page.locator(
            "[data-testid='recordings-list'], .recordings-list, .sessions-table"
        )
        self.recording_row = page.locator(
            "[data-testid='recording-row'], .recording-item, .session-row"
        )
        self.filter_device_select = page.get_by_label("Device")
        self.filter_duration_input = page.get_by_label("Duration")
        self.apply_filter_button = page.get_by_role("button", name="Apply Filters")

        # Status
        self.active_status_badge = page.locator(".status-active, [data-status='active']")

    def goto(self):
        self._page.goto("/insights")
        self.wait_for_load()

    def goto_heatmaps(self):
        self.goto()
        self.heatmaps_tab.click()
        self._page.wait_for_load_state("domcontentloaded")

    def goto_recordings(self):
        self.goto()
        self.recordings_tab.click()
        self._page.wait_for_load_state("domcontentloaded")

    def create_heatmap(self, url: str, name: str, sample_size: int = 500):
        self.goto_heatmaps()
        self.create_heatmap_button.click()
        self.heatmap_url_input.fill(url)
        if self.heatmap_name_input.is_visible():
            self.heatmap_name_input.fill(name)
        if self.sample_size_input.is_visible():
            self.sample_size_input.fill(str(sample_size))
        self.save_heatmap_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def switch_to_click_view(self):
        self.click_view_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def switch_to_scroll_view(self):
        self.scroll_view_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def switch_to_move_view(self):
        self.move_view_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def filter_recordings(self, device: str | None = None, min_duration: str | None = None):
        if device:
            self.filter_device_select.select_option(device)
        if min_duration:
            self.filter_duration_input.fill(min_duration)
        if self.apply_filter_button.is_visible():
            self.apply_filter_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def get_recording_count(self) -> int:
        return self.recording_row.count()

    def expect_heatmap_canvas_visible(self):
        expect(self.heatmap_canvas).to_be_visible(timeout=15_000)

    def expect_recordings_list_visible(self):
        expect(self.recordings_list).to_be_visible(timeout=10_000)

    def expect_heatmap_created(self, name: str):
        expect(self.heatmap_list).to_contain_text(name, timeout=10_000)
