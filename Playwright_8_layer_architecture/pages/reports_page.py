"""Layer 6 — Pages: VWO reports and dashboard page."""
import os
import time

from playwright.sync_api import Page, Download, expect

from pages.base_page import BasePage


class ReportsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.date_range_picker = page.locator(
            "[data-testid='date-range-picker'], .date-range-picker, .daterange-selector"
        )
        self.apply_date_button = page.get_by_role("button", name="Apply")
        self.export_button = page.get_by_role("button", name="Export")
        self.csv_export_option = page.get_by_role("menuitem", name="CSV")
        self.report_widgets = page.locator(
            "[data-testid='report-widget'], .report-widget, .analytics-card"
        )
        self.loading_spinner = page.locator(
            "[data-testid='loading'], .loading-spinner, .spinner"
        )
        self.last_updated = page.locator(
            "[data-testid='last-updated'], .last-updated, .refresh-timestamp"
        )
        self.no_data_message = page.locator(
            "[data-testid='no-data'], .no-data-message, .empty-state"
        )

    def goto(self):
        self._page.goto("/reports")
        self.wait_for_load()
        self._wait_for_data()

    def _wait_for_data(self, timeout: int = 10_000):
        self.loading_spinner.wait_for(state="hidden", timeout=timeout)

    def set_date_range(self, label: str = "Last 30 days"):
        self.date_range_picker.click()
        self._page.get_by_role("option", name=label).click()
        if self.apply_date_button.is_visible(timeout=2_000):
            self.apply_date_button.click()
        self._wait_for_data()

    def get_last_updated_text(self) -> str:
        return self.last_updated.inner_text()

    def export_csv(self, download_dir: str = "test-results/downloads") -> str:
        os.makedirs(download_dir, exist_ok=True)
        with self._page.expect_download() as download_info:
            self.export_button.click()
            if self.csv_export_option.is_visible(timeout=2_000):
                self.csv_export_option.click()
        download: Download = download_info.value
        save_path = os.path.join(download_dir, download.suggested_filename or "report.csv")
        download.save_as(save_path)
        return save_path

    def get_widget_count(self) -> int:
        return self.report_widgets.count()

    def measure_load_time_ms(self) -> float:
        start = time.monotonic()
        self.goto()
        return (time.monotonic() - start) * 1000

    def expect_reports_loaded(self):
        expect(self.report_widgets.first).to_be_visible(timeout=10_000)

    def expect_no_loading_spinner(self):
        expect(self.loading_spinner).to_be_hidden(timeout=10_000)

    def expect_data_present(self):
        expect(self.no_data_message).to_be_hidden()
        expect(self.report_widgets.first).to_be_visible()
