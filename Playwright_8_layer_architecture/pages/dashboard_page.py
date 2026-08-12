"""Layer 6 — Pages: VWO main dashboard."""
import time

from playwright.sync_api import Page, expect

from pages.base_page import BasePage


class DashboardPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.active_tests_count = page.locator(
            "[data-testid='active-tests-count'], .active-tests-count, .stats-active"
        )
        self.recent_campaigns_section = page.locator(
            "[data-testid='recent-campaigns'], .recent-campaigns, .campaign-list"
        )
        self.create_test_button = page.get_by_role("button", name="Create")
        self.visitor_count = page.locator(
            "[data-testid='visitor-count'], .visitor-count, .stats-visitors"
        )
        self.last_updated_label = page.locator(
            "[data-testid='last-updated'], .last-updated, .data-freshness"
        )

    def goto(self):
        self._page.goto("/dashboard")
        self.wait_for_load()

    def get_active_tests_count(self) -> int:
        text = self.active_tests_count.inner_text()
        return int("".join(filter(str.isdigit, text)) or "0")

    def get_visitor_count_text(self) -> str:
        return self.visitor_count.inner_text()

    def get_load_time_ms(self) -> float:
        start = time.monotonic()
        self.goto()
        self.wait_for_load()
        return (time.monotonic() - start) * 1000

    def click_create_test(self):
        self.create_test_button.click()

    def expect_dashboard_loaded(self):
        expect(self.recent_campaigns_section).to_be_visible(timeout=10_000)

    def expect_active_tests_visible(self):
        expect(self.active_tests_count).to_be_visible()
