"""Layer 6 — Pages: VWO Personalization campaign management."""
from playwright.sync_api import Page, expect

from pages.base_page import BasePage


class PersonalizationPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.create_campaign_button = page.get_by_role("button", name="Create Campaign")
        self.campaign_name_input = page.get_by_label("Campaign Name")
        self.campaign_url_input = page.get_by_label("Page URL")
        self.save_button = page.get_by_role("button", name="Save")
        self.next_button = page.get_by_role("button", name="Next")

        self.audience_tab = page.get_by_role("tab", name="Audience")
        self.add_segment_button = page.get_by_role("button", name="Add Segment")

        self.activate_button = page.get_by_role("button", name="Activate")
        self.confirm_activate_button = page.get_by_role("button", name="Confirm")

        self.campaign_status = page.locator(
            "[data-testid='campaign-status'], .campaign-status-badge, .status-badge"
        )
        self.campaigns_list = page.locator(
            "[data-testid='campaigns-list'], .campaigns-list, .campaigns-table"
        )

    def goto(self):
        self._page.goto("/personalize")
        self.wait_for_load()

    def create_campaign(self, name: str, url: str):
        self.create_campaign_button.click()
        self.campaign_name_input.fill(name)
        self.campaign_url_input.fill(url)
        self.next_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def set_segment(self, condition: str, operator: str, value: str):
        self.audience_tab.click()
        self.add_segment_button.click()
        self._page.get_by_label("Condition").select_option(condition)
        self._page.get_by_label("Operator").select_option(operator)
        self._page.get_by_label("Value").fill(value)
        self.save_button.click()

    def activate_campaign(self):
        self.activate_button.click()
        if self.confirm_activate_button.is_visible(timeout=3_000):
            self.confirm_activate_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def get_campaign_status(self) -> str:
        return self.campaign_status.inner_text().strip().lower()

    def expect_campaign_listed(self, name: str):
        expect(self.campaigns_list).to_contain_text(name, timeout=10_000)

    def expect_status(self, status: str):
        expect(self.campaign_status).to_contain_text(status, ignore_case=True)
